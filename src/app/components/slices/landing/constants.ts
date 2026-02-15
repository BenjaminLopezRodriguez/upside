/* ─────────────────────── Illustrography System ─────────────────────── */
/*
 * UPSIDE ILLUSTROGRAPHY SYSTEM
 * Visual language: "Currency engraving meets modern editorial"
 *
 * IMAGE CATEGORIES:
 * 1. Product — Card payments, terminals, card-in-hand shots
 * 2. Data    — Dashboards, analytics screens, financial charts
 * 3. Process — Documents, receipts, invoices, paper-based
 * 4. People  — Teams collaborating, business meetings
 * 5. Texture — Abstract purple textures for backgrounds
 */

export const IMAGES = {
  // Product / Card imagery
  cardHeld:
    "https://plus.unsplash.com/premium_photo-1664202219791-58870741c9dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  cardTerminal:
    "https://images.unsplash.com/photo-1556742031-c6961e8560b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  cardPayment:
    "https://images.unsplash.com/photo-1728044849325-47f4f5a21da3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",

  // Data / Dashboard imagery
  dashboardAnalytics:
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  tabletAnalytics:
    "https://images.unsplash.com/photo-1748609160056-7b95f30041f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  dataScreen:
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",

  // Documents / Receipts / Invoices
  invoiceDocument:
    "https://images.unsplash.com/photo-1554224155-cfa08c2a758f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  receiptPhone:
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  financeBills:
    "https://plus.unsplash.com/premium_photo-1661433019622-851b0fb9b58d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",

  // People / Teams
  teamMeeting:
    "https://images.unsplash.com/photo-1758518729685-f88df7890776?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  teamCollab:
    "https://images.unsplash.com/photo-1758873268364-15bef4162221?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  officeHallway:
    "https://images.unsplash.com/photo-1758691736995-fd7222612210?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",

  // Abstract / Texture
  purpleGoldLiquid:
    "https://images.unsplash.com/photo-1743275062438-4502369061a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
  purpleGoldAbstract:
    "https://images.unsplash.com/photo-1743275062441-d392b5bd8fba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
  abstractShapes:
    "https://plus.unsplash.com/premium_photo-1747939639350-fef62332ccd5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
} as const;

export const FEATURES = [
  {
    id: "spend",
    label: "Spend Controls",
    number: "01",
    description: "Set controls for your corporate cards",
    detail:
      "Define spend limits, merchant restrictions, and approval workflows per card, team, or program. Real-time visibility into every transaction with instant alerts and automated policy enforcement.",
    image: IMAGES.cardHeld,
    imageAlt: "Premium corporate card being held",
  },
  {
    id: "receipts",
    label: "Receipt Tracking",
    number: "02",
    description: "Automatic receipt capture and matching",
    detail:
      "Every transaction is automatically matched to a receipt. AI-powered categorization, OCR extraction, and audit-ready documentation. No more chasing down paper receipts.",
    image: IMAGES.financeBills,
    imageAlt: "Entrepreneur analyzing financial documents and receipts",
  },
  {
    id: "invoicing",
    label: "Invoicing",
    number: "03",
    description: "Send and manage invoices seamlessly",
    detail:
      "Create, send, and track invoices with automated payment reminders. Reconcile payments against your books in real time. Connect to your existing accounting tools.",
    image: IMAGES.invoiceDocument,
    imageAlt: "Clean invoice document on white surface",
  },
  {
    id: "more",
    label: "Integrations",
    number: "04",
    description: "Reporting, APIs, and beyond",
    detail:
      "REST APIs, webhooks, ERP integrations, custom reports, and everything else your finance team needs to stay in control.",
    image: IMAGES.dashboardAnalytics,
    imageAlt: "Performance analytics dashboard on laptop screen",
  },
];

export const STATS = [
  { value: "99.9%", label: "Uptime SLA" },
  { value: "<50ms", label: "API response" },
  { value: "256-bit", label: "Encryption" },
  { value: "SOC 2", label: "Compliant" },
];

export const STEPS = [
  {
    step: "01",
    title: "Connect",
    description:
      "Link your bank accounts and existing cards. We handle the heavy lifting of integration.",
    image: IMAGES.cardTerminal,
    imageAlt: "Card being inserted into payment terminal",
  },
  {
    step: "02",
    title: "Configure",
    description:
      "Set spend policies, approval chains, and receipt rules that match how your team works.",
    image: IMAGES.tabletAnalytics,
    imageAlt: "Person analyzing financial data on a tablet",
  },
  {
    step: "03",
    title: "Control",
    description:
      "Issue cards, track receipts, and manage invoices from a single dashboard. Real-time, always.",
    image: IMAGES.dataScreen,
    imageAlt: "Financial dashboard graphical interface",
  },
];

export const NAV_LINKS = [
  { href: "#features", label: "Product", icon: "layers" },
  { href: "#how-it-works", label: "How it works", icon: "workflow" },
  { href: "#contact", label: "Contact", icon: "mail" },
] as const;
