/**
 * Lithic API client for card issuing and digital wallet provisioning.
 * When LITHIC_API_KEY is not set, all functions return null / no-op so the app works without Lithic.
 */
import { env } from "@/env";

type LithicClient = InstanceType<Awaited<typeof import("lithic")>["default"]>;
let client: LithicClient | null = null;

async function getClient(): Promise<LithicClient | null> {
  if (!env.LITHIC_API_KEY) return null;
  if (!client) {
    const { default: Lithic } = await import("lithic");
    client = new Lithic({
      apiKey: env.LITHIC_API_KEY,
      environment: env.LITHIC_ENVIRONMENT,
    });
  }
  return client;
}

export type LithicCardType = "VIRTUAL" | "PHYSICAL";

export interface CreateLithicCardResult {
  token: string;
  lastFour: string;
}

/**
 * Create a card in Lithic. Returns null if Lithic is not configured.
 */
export async function createLithicCard(params: {
  type: LithicCardType;
  spendLimitCents?: number;
  memo?: string;
}): Promise<CreateLithicCardResult | null> {
  const lithic = await getClient();
  if (!lithic) return null;

  const card = await lithic.cards.create({
    type: params.type,
    ...(params.spendLimitCents != null && {
      spend_limit: params.spendLimitCents,
      spend_limit_duration: "TRANSACTION",
    }),
    ...(params.memo != null && { memo: params.memo }),
  });

  const raw = card as unknown as Record<string, unknown>;
  const lastFourRaw =
    (raw.last_four as string | undefined) ??
    (raw.lastFour as string | undefined) ??
    (raw.pan ? String(raw.pan).slice(-4) : "");
  const lastFour =
    lastFourRaw.length >= 4 ? lastFourRaw.slice(-4) : lastFourRaw.padStart(4, "0").slice(-4);
  return {
    token: (raw.token as string) ?? "",
    lastFour,
  };
}

export type DigitalWalletType = "APPLE_PAY" | "GOOGLE_PAY";

export type ProvisioningPayload =
  | string
  | {
      activationData: string;
      ephemeralPublicKey: string;
      encryptedData: string;
    };

/**
 * Get the provisioning payload for adding a card to a digital wallet.
 * Used for "Add to Apple Wallet" / "Save to Google Wallet".
 */
export async function provisionCardForWallet(
  lithicCardToken: string,
  digitalWallet: DigitalWalletType,
  options?: {
    /** Apple Pay: device certificate (base64). Omit to get only activationData. */
    certificate?: string;
    nonce?: string;
    nonce_signature?: string;
    /** Google/Samsung Pay (Visa): device identifiers */
    client_wallet_account_id?: string;
    client_device_id?: string;
  }
): Promise<ProvisioningPayload | null> {
  const lithic = await getClient();
  if (!lithic) return null;

  const response = await lithic.cards.provision(lithicCardToken, {
    digital_wallet: digitalWallet,
    ...(options?.certificate != null && { certificate: options.certificate }),
    ...(options?.nonce != null && { nonce: options.nonce }),
    ...(options?.nonce_signature != null && {
      nonce_signature: options.nonce_signature,
    }),
    ...(options?.client_wallet_account_id != null && {
      client_wallet_account_id: options.client_wallet_account_id,
    }),
    ...(options?.client_device_id != null && {
      client_device_id: options.client_device_id,
    }),
  });

  return response.provisioning_payload as ProvisioningPayload;
}

export function isLithicConfigured(): boolean {
  return !!env.LITHIC_API_KEY;
}

/** Apple Pay web push: response for jwsResolver */
export interface AppleWebProvisionResult {
  jws: { header: { kid: string }; protected: string; payload: string; signature: string };
  state: string;
}

/** Google Pay web push: response for pushPaymentCredentials */
export interface GoogleWebProvisionResult {
  google_opc: string;
  tsp_opc: string;
}

/**
 * Web push provision for Apple Pay. Returns JWS + state for Apple's script.
 * Call from your backend when Apple's jwsResolver callback runs.
 */
export async function webProvisionApplePay(
  lithicCardToken: string
): Promise<AppleWebProvisionResult | null> {
  const lithic = await getClient();
  if (!lithic) return null;
  const cards = lithic.cards as { webProvision: (token: string, body: { digital_wallet: string }) => Promise<AppleWebProvisionResult> };
  return cards.webProvision(lithicCardToken, { digital_wallet: "APPLE_PAY" });
}

/**
 * Web push provision for Google Pay. Pass session ids from onSessionCreated.
 * Returns credentials for googlepay.pushPaymentCredentials().
 */
export async function webProvisionGooglePay(
  lithicCardToken: string,
  params: {
    server_session_id: string;
    client_device_id: string;
    client_wallet_account_id: string;
  }
): Promise<GoogleWebProvisionResult | null> {
  const lithic = await getClient();
  if (!lithic) return null;
  const cards = lithic.cards as {
    webProvision: (
      token: string,
      body: {
        digital_wallet: string;
        server_session_id: string;
        client_device_id: string;
        client_wallet_account_id: string;
      }
    ) => Promise<GoogleWebProvisionResult>;
  };
  return cards.webProvision(lithicCardToken, {
    digital_wallet: "GOOGLE_PAY",
    ...params,
  });
}
