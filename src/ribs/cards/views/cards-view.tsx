"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import Script from "next/script";
import { CardsRib } from "../rib";
import { PaymentCard } from "@/components/payment-card";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/page-header";
import { toast } from "sonner";
import { Building01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlusSignIcon,
  CreditCardIcon,
  AppleIcon,
  GoogleIcon,
  CustomizeIcon,
  FilterIcon,
  PauseCircleIcon,
  SecurityBlockIcon,
  Delete02Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useOrg } from "@/contexts/org-context";
import { env } from "@/env";
import { ScrollArea } from "@/components/ui/scroll-area";

const typeOptions = [
  { label: "Virtual", value: "virtual" },
  { label: "Physical", value: "physical" },
];

const CARD_COLOR_OPTIONS = [
  { value: "lime", bg: "bg-lime-400" },
  { value: "sky", bg: "bg-sky-400" },
  { value: "amber", bg: "bg-amber-400" },
  { value: "rose", bg: "bg-rose-400" },
  { value: "violet", bg: "bg-violet-400" },
  { value: "emerald", bg: "bg-emerald-400" },
] as const;

const MATERIAL_OPTIONS = [
  { label: "Plastic", value: "plastic" },
  { label: "Metal", value: "metal" },
];

type CardListItem = {
  id: number;
  name: string;
  last4: string;
  type: "virtual" | "physical";
  status: "active" | "frozen" | "cancelled";
  spendLimitCents: number;
  currentSpendCents: number;
  cardColor?: string | null;
  logoUrl?: string | null;
};

const PEEK_STRIP_HEIGHT = 64;
const STACK_MAX_WIDTH = 620;
const CARD_BG_PEEK: Record<string, string> = {
  lime: "bg-lime-400",
  sky: "bg-sky-400",
  amber: "bg-amber-400",
  rose: "bg-rose-400",
  violet: "bg-violet-400",
  emerald: "bg-emerald-400",
};

function CardPeekStrip({
  card,
  isActive,
  onClick,
}: {
  card: CardListItem;
  isActive: boolean;
  onClick: () => void;
}) {
  const bgClass = (card.cardColor && CARD_BG_PEEK[card.cardColor]) || "bg-lime-400";
  const spendPercent =
    card.spendLimitCents > 0
      ? Math.min(Math.round((card.currentSpendCents / card.spendLimitCents) * 100), 100)
      : 0;
  const spent = Math.round(card.currentSpendCents / 100).toLocaleString();
  const limit = Math.round(card.spendLimitCents / 100).toLocaleString();

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.995 }}
      transition={{ duration: 0.1 }}
      className={cn(
        "relative w-full text-left flex items-center gap-3.5 px-4 transition-colors duration-150",
        isActive ? "bg-muted/60" : "bg-transparent hover:bg-muted/30",
      )}
      style={{ height: PEEK_STRIP_HEIGHT, minHeight: PEEK_STRIP_HEIGHT }}
    >
      {/* Active indicator */}
      <motion.div
        animate={{ opacity: isActive ? 1 : 0, scaleY: isActive ? 1 : 0.5 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-primary origin-center"
        aria-hidden
      />

      {/* Mini card thumbnail */}
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-[6px] aspect-[1.586]",
          bgClass,
        )}
        style={{ height: 38 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-black/10 pointer-events-none" />
        <span className="absolute bottom-[3px] left-[5px] font-mono text-[6px] tracking-wider text-black/40 leading-none">
          {card.last4}
        </span>
      </div>

      {/* Card info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 mb-0.5">
          <p className="truncate text-sm font-medium leading-tight text-foreground">{card.name}</p>
          {card.status !== "active" && (
            <span
              className={cn(
                "shrink-0 rounded-full px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide leading-none",
                card.status === "frozen"
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {card.status}
            </span>
          )}
        </div>
        {/* Spend bar */}
        <div className="h-[3px] w-full rounded-full bg-border/60 overflow-hidden">
          <motion.div
            className={cn(
              "h-full rounded-full",
              spendPercent >= 90
                ? "bg-destructive/70"
                : spendPercent >= 75
                  ? "bg-amber-500/70"
                  : "bg-foreground/25",
            )}
            initial={false}
            animate={{ width: `${spendPercent}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Spend amounts */}
      <div className="shrink-0 text-right">
        <p className="text-xs font-semibold tabular-nums text-foreground/80">${spent}</p>
        <p className="text-[10px] text-muted-foreground tabular-nums">of ${limit}</p>
      </div>
    </motion.button>
  );
}

function CardStack({
  cards,
  frontIndex,
  onFrontIndexChange,
  onCardClick,
  renderCard,
}: {
  cards: CardListItem[];
  frontIndex: number;
  onFrontIndexChange: (index: number) => void;
  onCardClick: (card: CardListItem) => void;
  renderCard: (card: CardListItem, opts: { isFront: boolean }) => React.ReactNode;
}) {
  if (cards.length === 0) return null;

  const frontCard = cards[frontIndex]!;

  return (
    <div className="mx-auto w-full" style={{ maxWidth: STACK_MAX_WIDTH }}>
      {/* Active card */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={frontCard.id}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
          onClick={() => onCardClick(frontCard)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onCardClick(frontCard);
            }
          }}
          role="button"
          tabIndex={0}
          className="cursor-pointer overflow-hidden rounded-2xl border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {renderCard(frontCard, { isFront: true })}
        </motion.div>
      </AnimatePresence>

      {/* Card list */}
      <ul className="mt-3 overflow-hidden rounded-xl border border-border divide-y divide-border">
        <AnimatePresence initial={false}>
          {cards.map((card, index) => (
            <motion.li
              key={card.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, delay: index * 0.03, ease: "easeOut" }}
            >
              <CardPeekStrip
                card={card}
                isActive={index === frontIndex}
                onClick={() => onFrontIndexChange(index)}
              />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

export function CardsView() {
  const vm = CardsRib.useViewModel();
  const utils = api.useUtils();
  const { activeOrgId } = useOrg();
  const detailRoute = CardsRib.useRoute("detail");
  const createRoute = CardsRib.useRoute("createCard");
  const [requestCardOpen, setRequestCardOpen] = useState(false);
  const { data: fromOrgs = [] } = api.organization.getPersonalFromOrgs.useQuery(undefined, {
    enabled: vm.inPersonal && requestCardOpen,
  });
  const requestCard = api.card.requestCardFromOrg.useMutation({
    onSuccess: () => {
      toast.success("Card request sent. Your organization will review it.");
      void utils.card.listIssuedToMe.invalidate();
      void utils.organization.getPersonalFromOrgs.invalidate();
      setRequestCardOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });
  const [confirmAction, setConfirmAction] = useState<{
    type: "freeze" | "cancel" | "delete";
    cardId: number;
  } | null>(null);
  const [stackFrontIndex, setStackFrontIndex] = useState(0);
  const [showFloatingFooter, setShowFloatingFooter] = useState(false);
  const headerButtonRef = useRef<HTMLDivElement>(null);
  const [walletProvisioning, setWalletProvisioning] = useState<
    "idle" | "apple" | "google"
  >("idle");
  const [appleScriptReady, setAppleScriptReady] = useState(false);
  const cardIdForWalletRef = useRef<number | null>(null);
  const isMobile = useIsMobile();
  const getGoogleWalletCreds = api.card.getGoogleWalletWebProvision.useMutation({
    onSuccess: (creds) => {
      const gp = (window as unknown as { googlepay?: { pushPaymentCredentials: (c: unknown) => void } }).googlepay;
      if (typeof gp?.pushPaymentCredentials === "function") {
        gp.pushPaymentCredentials(creds);
        toast.success("Card added to Google Pay");
      }
      setWalletProvisioning("idle");
    },
    onError: (err) => {
      toast.error(err.message ?? "Could not add to Google Pay");
      setWalletProvisioning("idle");
    },
  });

  useEffect(() => {
    cardIdForWalletRef.current =
      detailRoute.attached && vm.selectedCard?.lithicCardToken
        ? vm.selectedCard.id
        : null;
  }, [detailRoute.attached, vm.selectedCard?.id, vm.selectedCard?.lithicCardToken]);

  useEffect(() => {
    if (
      !detailRoute.attached ||
      !vm.selectedCard?.lithicCardToken ||
      !appleScriptReady ||
      typeof (window as unknown as { initAddToAppleWallet?: (opts: unknown) => void }).initAddToAppleWallet !== "function"
    )
      return;
    const partnerId = env.NEXT_PUBLIC_LITHIC_APPLE_PARTNER_ID ?? "ORG-97a7c2b2-11ec-4d6d-a3f7-c3d06f4b2703";
    const cardId = vm.selectedCard.id;
    (window as unknown as { initAddToAppleWallet: (opts: {
      partnerId: string;
      domain: string;
      buttonId: string;
      jwsResolver: () => Promise<unknown>;
      resultResolver?: (r: { status: string }) => void;
    }) => void }).initAddToAppleWallet({
      partnerId,
      domain: "https://apple-pay.apple.com",
      buttonId: "add-to-apple-wallet",
      jwsResolver: async () => {
        const r = await utils.card.getAppleWalletWebProvision.fetch({ cardId });
        return r.jws;
      },
      resultResolver: (result) => {
        if (["200", "202", "206"].includes(result.status))
          toast.success("Added to Apple Wallet");
        else if (result.status === "500")
          toast.error("Could not add to Apple Wallet");
      },
    });
  }, [
    detailRoute.attached,
    vm.selectedCard?.id,
    vm.selectedCard?.lithicCardToken,
    appleScriptReady,
    utils,
  ]);

  const handleConfirm = useCallback(() => {
    if (!confirmAction) return;
    if (confirmAction.type === "freeze") vm.handleFreeze(confirmAction.cardId);
    else if (confirmAction.type === "cancel") vm.handleCancel(confirmAction.cardId);
    else vm.handleDelete(confirmAction.cardId);
    setConfirmAction(null);
  }, [confirmAction, vm]);

  useEffect(() => {
    if (vm.cardList.length > 0 && stackFrontIndex >= vm.cardList.length) {
      setStackFrontIndex(Math.max(0, vm.cardList.length - 1));
    }
  }, [vm.cardList.length, stackFrontIndex]);

  useEffect(() => {
    const el = headerButtonRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowFloatingFooter(!entry!.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="animate-page-in space-y-8">
      <Script
        src="https://smp-device-content.apple.com/navweb/asset/initAddToAppleWallet.js"
        strategy="lazyOnload"
        onLoad={() => setAppleScriptReady(true)}
      />
      <Script
        src="https://developers.google.com/static/pay/issuers/apis/push-provisioning/web/downloads/integration.min.js"
        strategy="lazyOnload"
      />
      <PageHeader
        title="Cards"
        description={
          vm.inPersonal
            ? "Cards issued to you by your organizations."
            : "Issue virtual/physical cards, monitor spend, and control access."
        }
        actions={
          <div ref={headerButtonRef}>
            {vm.inPersonal ? (
              <Button onClick={() => setRequestCardOpen(true)}>
                <HugeiconsIcon
                  icon={CreditCardIcon}
                  strokeWidth={2}
                  data-icon="inline-start"
                />
                Request card
              </Button>
            ) : (
              <Button onClick={vm.openCreate}>
                <HugeiconsIcon
                  icon={PlusSignIcon}
                  strokeWidth={2}
                  data-icon="inline-start"
                />
                New Card
              </Button>
            )}
          </div>
        }
      />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {vm.cardList.length} {vm.cardList.length === 1 ? "card" : "cards"}
        </p>
      </div>

      {vm.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[1.586] w-full rounded-2xl" />
          ))}
        </div>
      ) : vm.cardList.length === 0 ? (
        <Empty className="border-border rounded-lg border border-dashed py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={CreditCardIcon} className="size-6" />
            </EmptyMedia>
            <EmptyTitle>
              {vm.inPersonal ? "No cards issued to you yet" : "No cards yet"}
            </EmptyTitle>
            <EmptyDescription>
              {vm.inPersonal
                ? "Request a card from one of your organizations to get started."
                : "Create a virtual or physical card to start spending."}
            </EmptyDescription>
          </EmptyHeader>
          {vm.inPersonal ? (
            <Button onClick={() => setRequestCardOpen(true)}>
              <HugeiconsIcon
                icon={CreditCardIcon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              Request card
            </Button>
          ) : (
            <Button onClick={vm.openCreate}>
              <HugeiconsIcon
                icon={PlusSignIcon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              New Card
            </Button>
          )}
        </Empty>
      ) : isMobile ? (
        <CardStack
          cards={vm.cardList}
          frontIndex={stackFrontIndex}
          onFrontIndexChange={setStackFrontIndex}
          onCardClick={(card) => vm.openDetail(card.id)}
          renderCard={(card, { isFront }) => (
            <PaymentCard
              cardName={card.name}
              last4={card.last4}
              type={card.type}
              status={card.status}
              spendLimitCents={card.spendLimitCents}
              currentSpendCents={card.currentSpendCents}
              cardColor={card.cardColor}
              issuerLogo={
                card.logoUrl ? (
                  <img src={card.logoUrl} alt="" className="h-full w-full object-contain" />
                ) : undefined
              }
              onClick={isFront ? undefined : () => vm.openDetail(card.id)}
              className={!isFront ? "opacity-90" : undefined}
            />
          )}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vm.cardList.map((card) => (
            <PaymentCard
              key={card.id}
              cardName={card.name}
              last4={card.last4}
              type={card.type}
              status={card.status}
              spendLimitCents={card.spendLimitCents}
              currentSpendCents={card.currentSpendCents}
              cardColor={card.cardColor}
              issuerLogo={card.logoUrl ? <img src={card.logoUrl} alt="" className="h-full w-full object-contain" /> : undefined}
              onClick={() => vm.openDetail(card.id)}
            />
          ))}
        </div>
      )}

      {/* Floating footer */}
      <AnimatePresence>
        {showFloatingFooter && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="fixed inset-x-0 bottom-0 z-50"
          >
            <div className="border-t border-border bg-background/90 backdrop-blur-xl">
              <div className="flex items-center justify-between px-5 pt-3 pb-[calc(0.875rem+env(safe-area-inset-bottom))]">
                <p className="text-sm font-medium text-muted-foreground">Cards</p>
                {vm.inPersonal ? (
                  <Button size="sm" onClick={() => setRequestCardOpen(true)}>
                    <HugeiconsIcon icon={CreditCardIcon} strokeWidth={2} data-icon="inline-start" />
                    Request card
                  </Button>
                ) : (
                  <Button size="sm" onClick={vm.openCreate}>
                    <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} data-icon="inline-start" />
                    New Card
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create card dialog (org only) */}
      {!vm.inPersonal && (
        <CreateCardDialog
          open={createRoute.attached}
          onClose={vm.closeCreate}
          onCreate={vm.handleCreate}
          orgId={activeOrgId ?? null}
        />
      )}

      {/* Request card dialog (personal only) */}
      {vm.inPersonal && (
        <Dialog open={requestCardOpen} onOpenChange={setRequestCardOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Request a card</DialogTitle>
              <DialogDescription>
                Your organization will review the request and can issue you a card.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2">
              {fromOrgs.filter((o) => !o.hasPendingCardRequest).length === 0 ? (
                <p className="text-muted-foreground text-sm py-4">
                  {fromOrgs.length === 0
                    ? "Join an organization to request a card."
                    : "You have a pending card request for each organization."}
                </p>
              ) : (
                fromOrgs
                  .filter((o) => !o.hasPendingCardRequest)
                  .map((org) => (
                    <div
                      key={org.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          {org.logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={org.logoUrl}
                              alt=""
                              className="size-full rounded-lg object-contain"
                            />
                          ) : (
                            <HugeiconsIcon icon={Building01Icon} className="size-5" strokeWidth={2} />
                          )}
                        </div>
                        <p className="font-medium truncate">{org.name}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => requestCard.mutate({ organizationId: org.id })}
                        disabled={requestCard.isPending}
                      >
                        Request
                      </Button>
                    </div>
                  ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Detail sheet — bottom on mobile, right on desktop */}
      <Sheet
        open={detailRoute.attached}
        onOpenChange={(open) => {
          if (!open) vm.closeDetail();
        }}
      >
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          showCloseButton={false}
          className={cn(
            "flex flex-col gap-0",
            isMobile && "max-h-[90vh] rounded-t-2xl",
          )}
        >
          {vm.selectedCard && (
            <>
              <SheetHeader className="flex flex-row items-center justify-between gap-2 px-6 pb-4 pt-6">
                <SheetTitle className="min-w-0 flex-1 truncate">
                  {vm.selectedCard.cardName}
                </SheetTitle>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Rules"
                    onClick={() => toast.info("Card rules — coming soon")}
                  >
                    <HugeiconsIcon icon={FilterIcon} className="size-4" strokeWidth={2} />
                  </Button>
                  {vm.selectedCard.status === "active" && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Freeze card"
                      onClick={() =>
                        setConfirmAction({
                          type: "freeze",
                          cardId: vm.selectedCard!.id,
                        })
                      }
                    >
                      <HugeiconsIcon icon={PauseCircleIcon} className="size-4" strokeWidth={2} />
                    </Button>
                  )}
                  {vm.selectedCard.status !== "cancelled" && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Cancel card"
                      onClick={() =>
                        setConfirmAction({
                          type: "cancel",
                          cardId: vm.selectedCard!.id,
                        })
                      }
                    >
                      <HugeiconsIcon icon={SecurityBlockIcon} className="size-4" strokeWidth={2} />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Delete card"
                    onClick={() =>
                      setConfirmAction({
                        type: "delete",
                        cardId: vm.selectedCard!.id,
                      })
                    }
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <HugeiconsIcon icon={Delete02Icon} className="size-4" strokeWidth={2} />
                  </Button>
                  <SheetClose
                    render={
                      <Button variant="ghost" size="icon-sm" aria-label="Close" />
                    }
                  >
                    <HugeiconsIcon icon={Cancel01Icon} className="size-4" strokeWidth={2} />
                    <span className="sr-only">Close</span>
                  </SheetClose>
                </div>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-6 pb-6">
                <PaymentCard
                  cardName={vm.selectedCard.cardName}
                  last4={vm.selectedCard.last4}
                  type={vm.selectedCard.type}
                  status={vm.selectedCard.status}
                  spendLimitCents={vm.selectedCard.spendLimit}
                  currentSpendCents={vm.selectedCard.currentSpend}
                  cardColor={vm.selectedCard.cardColor}
                  issuerLogo={vm.selectedCard.logoUrl ? <img src={vm.selectedCard.logoUrl} alt="" className="h-full w-full object-contain" /> : undefined}
                />

                {/* Wallet buttons (Lithic provisioning — only for cards with lithicCardToken) */}
                <div className="mt-4 flex flex-col gap-2">
                  {vm.selectedCard.lithicCardToken ? (
                    <>
                  <button
                    id="add-to-apple-wallet"
                    type="button"
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-black px-4 text-white transition-opacity hover:opacity-80 active:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
                  >
                    <HugeiconsIcon
                      icon={AppleIcon}
                      className="size-4 shrink-0"
                      strokeWidth={0}
                    />
                    <span className="text-[13px] font-medium">
                      Add to Apple Wallet
                    </span>
                  </button>
                  <button
                    type="button"
                    disabled={walletProvisioning !== "idle"}
                    onClick={() => {
                      if (!vm.selectedCard) return;
                      const gp = (window as unknown as {
                        googlepay?: {
                          openAppWindow: (opts: {
                            integratorId: string;
                            tokenSetting: number;
                            cardSetting: number;
                            isTestEnvironment: boolean;
                            clientSessionId: string;
                            hl: string;
                            onSessionCreated: (payload: {
                              serverSessionId?: string;
                              publicDeviceId?: string;
                              publicWalletId?: string;
                            }) => Promise<void>;
                            onSuccess: () => void;
                            onFailure: (p: unknown) => void;
                            onCancel: () => void;
                          }) => void;
                        };
                      }).googlepay;
                      if (!gp?.openAppWindow) {
                        toast.error("Google Pay script not loaded yet. Try again.");
                        return;
                      }
                      setWalletProvisioning("google");
                      gp.openAppWindow({
                        integratorId: "LITHIC",
                        tokenSetting: 1,
                        cardSetting: 1,
                        isTestEnvironment: process.env.NODE_ENV !== "production",
                        clientSessionId: `card-${vm.selectedCard.id}-${Date.now()}`,
                        hl: "en-US",
                        onSessionCreated: async (payload) => {
                          try {
                            await getGoogleWalletCreds.mutateAsync({
                              cardId: vm.selectedCard!.id,
                              server_session_id:
                                payload.serverSessionId ??
                                (payload as { server_session_id?: string }).server_session_id ??
                                "",
                              client_device_id:
                                payload.publicDeviceId ??
                                (payload as { client_device_id?: string }).client_device_id ??
                                "",
                              client_wallet_account_id:
                                payload.publicWalletId ??
                                (payload as { client_wallet_account_id?: string }).client_wallet_account_id ??
                                "",
                            });
                          } catch {
                            setWalletProvisioning("idle");
                          }
                        },
                        onSuccess: () => {
                          setWalletProvisioning("idle");
                        },
                        onFailure: () => {
                          toast.error("Could not add to Google Pay");
                          setWalletProvisioning("idle");
                        },
                        onCancel: () => setWalletProvisioning("idle"),
                      });
                    }}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-50"
                  >
                    <HugeiconsIcon
                      icon={GoogleIcon}
                      className="size-4 shrink-0"
                      strokeWidth={0}
                    />
                    <span className="text-[13px] font-medium">
                      {walletProvisioning === "google"
                        ? "Adding…"
                        : "Save to Google Wallet"}
                    </span>
                  </button>
                    </>
                  ) : (
                    <p className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                      Add to Wallet is available for cards issued with Lithic. Create a new card with Lithic configured to use Apple Pay or Google Pay.
                    </p>
                  )}
                </div>

                {/* Recent activity */}
                <div className="mt-6 border-t border-border pt-6">
                  <h3 className="mb-2 text-sm font-medium text-foreground">
                    Recent activity
                  </h3>
                  {vm.selectedCard.transactions?.length ? (
                    <ul className="divide-y divide-border rounded-lg border border-border">
                      {vm.selectedCard.transactions.map((tx) => (
                        <li
                          key={tx.id}
                          className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">
                              {tx.merchant?.name ?? "Merchant"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {tx.transactionDate
                                ? new Date(tx.transactionDate).toLocaleDateString(
                                    undefined,
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    },
                                  )
                                : ""}
                            </p>
                          </div>
                          <span className="shrink-0 font-medium tabular-nums">
                            ${((tx.amount ?? 0) / 100).toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="rounded-lg border border-border bg-muted/30 px-3 py-4 text-center text-sm text-muted-foreground">
                      No recent transactions
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={confirmAction !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === "delete"
                ? "Delete Card"
                : confirmAction?.type === "cancel"
                  ? "Cancel Card"
                  : "Freeze Card"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === "delete"
                ? "This will permanently delete the card and its transaction history. This cannot be undone."
                : confirmAction?.type === "cancel"
                  ? "This will permanently cancel the card. This action cannot be undone."
                  : "This will temporarily freeze the card. You can unfreeze it later."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction
              variant={
                confirmAction?.type === "cancel" || confirmAction?.type === "delete"
                  ? "destructive"
                  : "default"
              }
              onClick={handleConfirm}
            >
              {confirmAction?.type === "delete"
                ? "Delete Card"
                : confirmAction?.type === "cancel"
                  ? "Cancel Card"
                  : "Freeze Card"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CreateCardDialog({
  open,
  onClose,
  onCreate,
  orgId = null,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: {
    cardName: string;
    type: "virtual" | "physical";
    spendLimit: number;
    cardColor?: string;
    logoUrl?: string;
    material?: string;
  }) => void;
  orgId?: number | null;
}) {
  const utils = api.useUtils();
  const [name, setName] = useState("");
  const [type, setType] = useState<"virtual" | "physical">("virtual");
  const [limit, setLimit] = useState("5000");
  const [cardColor, setCardColor] = useState("lime");
  const [logoUrl, setLogoUrl] = useState("");
  const [material, setMaterial] = useState("plastic");
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);

  const { data: requests = [] } = api.card.listCardRequestsForOrg.useQuery(
    { orgId: orgId! },
    { enabled: open && orgId != null },
  );

  const resetForm = () => {
    setSelectedRequestId(null);
    setName("");
    setLimit("5000");
    setType("virtual");
    setCardColor("lime");
    setLogoUrl("");
    setMaterial("plastic");
  };

  const approveForRequest = api.card.approveCardRequestAndIssue.useMutation({
    onSuccess: () => {
      toast.success("Card issued");
      void utils.card.list.invalidate();
      void utils.card.listForOrg.invalidate();
      void utils.card.listCardRequestsForOrg.invalidate();
      onClose();
      resetForm();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const spendLimit = Math.round(parseFloat(limit) * 100);
    const payload = {
      cardName: name,
      type,
      spendLimit,
      cardColor,
      logoUrl: logoUrl.trim() || undefined,
      material: type === "physical" ? material : undefined,
    };
    if (selectedRequestId != null) {
      approveForRequest.mutate({
        requestId: selectedRequestId,
        ...payload,
      });
    } else {
      onCreate(payload);
      setName("");
      setLimit("5000");
      setCardColor("lime");
      setLogoUrl("");
      setMaterial("plastic");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          resetForm();
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Card</DialogTitle>
          <DialogDescription>
            Issue a new virtual or physical card
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field>
            <FieldLabel>Card Name</FieldLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Marketing Budget"
              required
            />
          </Field>
          <Field>
            <FieldLabel>Type</FieldLabel>
            <Select
              items={typeOptions}
              value={type}
              onValueChange={(v) => setType(v as "virtual" | "physical")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {typeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>

          {orgId != null && requests.length > 0 ? (
            <>
              <Field>
                <FieldLabel>Fulfill a request (optional)</FieldLabel>
                <ScrollArea className="max-h-[200px] rounded-lg border border-border">
                  <ul className="p-2 space-y-1">
                    {requests.map((req) => (
                      <li key={req.id}>
                        <label className={cn(
                          "flex items-center justify-between gap-3 rounded-md px-3 py-2 cursor-pointer transition-colors hover:bg-muted/50",
                          selectedRequestId === req.id && "bg-muted",
                        )}>
                          <span className="flex flex-col min-w-0">
                            <span className="font-medium truncate">{req.user.name}</span>
                            <span className="text-xs text-muted-foreground">
                              Requested {new Date(req.requestedAt).toLocaleDateString()}
                            </span>
                          </span>
                          <input
                            type="radio"
                            name="request"
                            checked={selectedRequestId === req.id}
                            onChange={() => setSelectedRequestId(selectedRequestId === req.id ? null : req.id)}
                            className="shrink-0"
                          />
                        </label>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </Field>
              <Field>
                <FieldLabel>Spend Limit ($)</FieldLabel>
                <Input
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  min="1"
                  required
                />
              </Field>
            </>
          ) : (
            <Field>
              <FieldLabel>Spend Limit ($)</FieldLabel>
              <Input
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                min="1"
                required
              />
            </Field>
          )}

          <Collapsible className="rounded-lg border border-border">
            <CollapsibleTrigger
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <HugeiconsIcon icon={CustomizeIcon} className="size-4 shrink-0" strokeWidth={2} />
              <span>Customize</span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-4 border-t border-border px-4 py-3">
                <Field>
                  <FieldLabel>Color</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {CARD_COLOR_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setCardColor(opt.value)}
                        className={cn(
                          "size-8 rounded-full border-2 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          opt.bg,
                          cardColor === opt.value
                            ? "border-foreground shadow-md"
                            : "border-transparent hover:shadow",
                        )}
                        title={opt.value}
                      />
                    ))}
                  </div>
                </Field>
                <Field>
                  <FieldLabel>Logo URL</FieldLabel>
                  <Input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://…"
                  />
                </Field>
                {type === "physical" && (
                  <Field>
                    <FieldLabel>Material</FieldLabel>
                    <Select value={material} onValueChange={setMaterial}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {MATERIAL_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose} disabled={approveForRequest.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={approveForRequest.isPending}>
              {selectedRequestId != null ? "Issue card" : "Create Card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
