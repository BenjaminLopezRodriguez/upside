# Deltra Style Guide

Reference for building new components that match the existing design system. Copy patterns directly from this file.

---

## Design Philosophy

**Ceramic**: Warm, organic surfaces. Layered shadows with inset highlights simulate light catching glazed ceramic. No hard outlines — use ring + shadow combos instead of `border`.

**Restrained motion**: Subtle fade-up entrances, soft hover lifts, no bouncing or spring physics. Respect `prefers-reduced-motion`.

**Lightning lime accent**: High-chroma lime green (`oklch hue 130`) pops against warm neutral surfaces (`oklch hue 75`).

---

## Color Tokens

Use semantic tokens, never raw colors. All defined in `globals.css`.

| Token | Usage |
|---|---|
| `bg-background` | Page background |
| `bg-card` / `text-card-foreground` | Card surfaces |
| `bg-primary` / `text-primary-foreground` | Primary buttons, active indicators |
| `bg-secondary` / `text-secondary-foreground` | Secondary buttons, subtle badges |
| `bg-muted` / `text-muted-foreground` | Disabled surfaces, help text, labels |
| `bg-accent` / `text-accent-foreground` | Hover states, sidebar highlights |
| `bg-destructive` | Destructive actions (always `bg-destructive/10` with `text-destructive`) |
| `border-border` | Default borders |
| `ring-ring` | Focus rings |

### Chart colors

Use `var(--chart-1)` through `var(--chart-5)` for data visualization. Chart-1 is the primary lime.

---

## Radius

Base radius is `1rem`. Use the Tailwind scale:

| Class | Value |
|---|---|
| `rounded-sm` | `calc(1rem - 4px)` = 12px |
| `rounded-md` | `calc(1rem - 2px)` = 14px |
| `rounded-lg` | `1rem` = 16px |
| `rounded-xl` | `calc(1rem + 4px)` = 20px |
| `rounded-2xl` | `calc(1rem + 8px)` = 24px |
| `rounded-4xl` | Pill (buttons, badges) |

**Rule of thumb**: Cards = `rounded-2xl`. Buttons/badges = `rounded-4xl` (pill). Inputs/selects = `rounded-lg`. Inner elements (avatars, icons) = `rounded-[10px]` or `rounded-xl`.

---

## Shadows

### Card shadow (default)

Applied on all `<Card>` components:

```
shadow-[0_1px_3px_0_rgb(0_0_0/0.04),0_1px_2px_-1px_rgb(0_0_0/0.04),inset_0_1px_0_0_rgb(255_255_255/0.06)]
ring-1 ring-black/[0.04] dark:ring-white/[0.06]
```

The `inset 0 1px 0 0` creates the ceramic top-edge highlight. The `ring-1` adds a barely-visible outline.

### Card hover shadow

For interactive cards, add:

```
transition-[box-shadow] duration-200 ease-[var(--ease-out-smooth)]
hover:shadow-[0_4px_12px_0_rgb(0_0_0/0.06),0_1px_3px_0_rgb(0_0_0/0.04)]
dark:hover:shadow-[0_4px_16px_0_rgb(0_0_0/0.3),0_1px_4px_0_rgb(0_0_0/0.2)]
```

For stat cards that lift on hover, also add:

```
transition-[box-shadow,transform] hover:-translate-y-0.5
```

### Inset panel shadow (sidebar-inset)

Applied via CSS in `globals.css` on `[data-slot="sidebar-inset"]`:

```css
box-shadow:
  0 0 0 1px rgb(0 0 0 / 0.04),
  0 1px 2px 0 rgb(0 0 0 / 0.03),
  0 4px 16px -4px rgb(0 0 0 / 0.06);
```

### Logo/icon badge shadow

For branded icon containers (like the "U" logo):

```
shadow-[0_2px_8px_-2px_rgb(0_0_0/0.12),inset_0_1px_0_0_rgb(255_255_255/0.1)]
```

---

## Motion

### CSS custom properties

```css
--ease-out-smooth: cubic-bezier(0.22, 1, 0.36, 1);
--ease-in-out-smooth: cubic-bezier(0.65, 0, 0.35, 1);
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 400ms;
```

### Page entrance

Wrap page content in a div with `animate-page-in`:

```tsx
<div className="animate-page-in space-y-8">
  <PageHeader title="..." />
  {/* page content */}
</div>
```

For staggered children (stat cards, grid items):

```tsx
<StatCard className="animate-page-in stagger-1" />
<StatCard className="animate-page-in stagger-2" />
<StatCard className="animate-page-in stagger-3" />
```

Stagger classes: `stagger-1` (50ms) through `stagger-4` (200ms).

### Transitions

Never use `transition-all`. Always specify explicit properties:

```
transition-[color,background-color,border-color,box-shadow,opacity,transform]
```

For shadows only: `transition-[box-shadow]`.

Use `duration-200` with `ease-[var(--ease-out-smooth)]` for hover effects.

---

## Typography

| Element | Classes |
|---|---|
| Page title | `text-2xl font-semibold tracking-tight text-pretty` |
| Page description | `text-muted-foreground text-sm leading-relaxed` |
| Card title | `text-base font-medium` |
| Card description | `text-muted-foreground text-sm` |
| Table header | Default `<TableHead>` styles |
| Table cell (name/primary) | `font-medium` |
| Table cell (secondary) | `text-muted-foreground` |
| Table cell (money) | `text-right tabular-nums` |
| Stat value | `text-2xl font-bold tracking-tight tabular-nums` |
| Small label | `text-sm text-muted-foreground` |
| Sidebar logo title | `text-[15px] font-semibold leading-tight tracking-tight` |
| Sidebar logo subtitle | `text-[11px] text-muted-foreground leading-tight` |

Always use `tabular-nums` on numeric/monetary columns for alignment.

Always use `text-pretty` on headings to prevent orphaned words.

---

## Component Patterns

### Page structure

Every page view follows this structure:

```tsx
export function MyView() {
  const vm = MyRib.useViewModel();

  if (vm.isLoading) {
    return (
      <div className="animate-page-in space-y-8">
        <div className="h-14" /> {/* PageHeader height placeholder */}
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="animate-page-in space-y-8">
      <PageHeader
        title="Page Name"
        description="One-line explanation."
        actions={<Button>Action</Button>} {/* optional */}
      />
      {/* Cards, tables, etc. */}
    </div>
  );
}
```

### Card with table

```tsx
<Card>
  <CardHeader className="border-b border-border/60 pb-4">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">{count} items</span>
        <Separator orientation="vertical" className="mx-1 h-4 bg-border/60" />
        <Button variant="outline" size="sm">
          <HugeiconsIcon icon={Refresh01Icon} strokeWidth={2} data-icon="inline-start" />
          Refresh
        </Button>
        <Button variant="outline" size="sm">
          <HugeiconsIcon icon={Download01Icon} strokeWidth={2} data-icon="inline-start" />
          Export
        </Button>
      </div>
    </div>
  </CardHeader>
  <CardContent className="pt-4">
    <Separator className="mb-4 bg-border/50" />
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow
            key={item.id}
            className="cursor-pointer"
            tabIndex={0}
            role="button"
            onClick={() => openDetail(item.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openDetail(item.id);
              }
            }}
          >
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell><StatusBadge status={item.status} /></TableCell>
            <TableCell className="text-right tabular-nums">{item.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CardContent>
</Card>
```

### Empty state

```tsx
<Empty className="border-border/80 rounded-xl border border-dashed py-16">
  <EmptyHeader>
    <EmptyMedia variant="icon">
      <HugeiconsIcon icon={SomeIcon} className="size-6" />
    </EmptyMedia>
    <EmptyTitle>No items yet</EmptyTitle>
    <EmptyDescription>
      Items will show up here once created.
    </EmptyDescription>
  </EmptyHeader>
</Empty>
```

### Detail sheet

```tsx
<Sheet open={isOpen} onOpenChange={(open) => { if (!open) closeDetail(); }}>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>{detail.title}</SheetTitle>
      <SheetDescription>Subtitle or context</SheetDescription>
    </SheetHeader>
    <div className="space-y-4 py-4">
      <DetailRow label="Amount" value={detail.amount} />
      <DetailRow label="Status">
        <StatusBadge status={detail.status} />
      </DetailRow>
      <Separator />
      <DetailRow label="Category" value={detail.category} />
      <DetailRow label="Date" value={detail.date} />
    </div>
  </SheetContent>
</Sheet>
```

### Confirmation dialog (for destructive actions)

```tsx
<AlertDialog open={confirmAction !== null} onOpenChange={(open) => { if (!open) setConfirmAction(null); }}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Confirm Action</AlertDialogTitle>
      <AlertDialogDescription>
        This will do something. This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Go Back</AlertDialogCancel>
      <AlertDialogAction
        variant={isDestructive ? "destructive" : "default"}
        onClick={handleConfirm}
      >
        Confirm
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Stat card

```tsx
<Card className={cn(
  "transition-[box-shadow,transform] duration-200 ease-[var(--ease-out-smooth)]",
  "hover:shadow-[0_4px_12px_0_rgb(0_0_0/0.06),0_1px_3px_0_rgb(0_0_0/0.04)]",
  "dark:hover:shadow-[0_4px_16px_0_rgb(0_0_0/0.3),0_1px_4px_0_rgb(0_0_0/0.2)]",
  "hover:-translate-y-0.5",
  className,
)}>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardDescription>{title}</CardDescription>
    <span className="text-muted-foreground" aria-hidden="true">
      <HugeiconsIcon icon={Icon} className="size-5" strokeWidth={1.5} />
    </span>
  </CardHeader>
  <CardContent>
    <p className="text-2xl font-bold tracking-tight tabular-nums">{value}</p>
  </CardContent>
</Card>
```

### StatusBadge

Use the shared `<StatusBadge>` component for all status indicators. It renders a colored dot + capitalized label inside a `<Badge>`.

```tsx
import { StatusBadge } from "@/components/status-badge";

<StatusBadge status="pending" />   // amber dot, outline variant
<StatusBadge status="completed" /> // green dot, secondary variant
<StatusBadge status="declined" />  // red dot, destructive variant
```

To add a new status, add an entry to `STATUS_CONFIG` in `src/components/status-badge.tsx`.

### DetailRow

Use for label-value pairs in sheets/cards:

```tsx
import { DetailRow } from "@/components/detail-row";

<DetailRow label="Amount" value="$1,234.00" />
<DetailRow label="Status">
  <StatusBadge status="active" />
</DetailRow>
```

---

## Icons

Use [Hugeicons](https://hugeicons.com/) with `strokeWidth={2}` (default) or `strokeWidth={1.5}` (decorative/large).

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { SomeIcon } from "@hugeicons/core-free-icons";

<HugeiconsIcon icon={SomeIcon} strokeWidth={2} />
```

For icons inside buttons, add `data-icon="inline-start"` or `data-icon="inline-end"` to get automatic padding adjustments:

```tsx
<Button variant="outline" size="sm">
  <HugeiconsIcon icon={Download01Icon} strokeWidth={2} data-icon="inline-start" />
  Export
</Button>
```

Decorative icons (stat cards, empty states) should have `aria-hidden="true"`.

---

## Formatting

### Currency

```tsx
new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
}).format(amount)
```

### Dates

```tsx
new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
}).format(new Date(dateString))
```

Never use `date-fns` `format()` or raw `.toLocaleString()`. Always use `Intl` APIs.

---

## Accessibility Checklist

- Clickable `<TableRow>` elements must have `tabIndex={0}`, `role="button"`, and an `onKeyDown` handler for Enter/Space
- Search inputs need `aria-label="Search [thing] by [field]"`
- Select triggers need `aria-label="Filter by [field]"`
- Decorative icons need `aria-hidden="true"`
- Destructive actions (delete, reject, cancel) must show an `<AlertDialog>` confirmation
- All interactive elements must have visible focus styles (handled by the `outline-ring/50` base style)
- Respect `prefers-reduced-motion` (handled globally for `animate-page-in`)

---

## Dark Mode

- Dark mode is toggled via the `.dark` class on `<html>` (next-themes)
- Custom variant: `@custom-variant dark (&:is(.dark *))`
- Always provide dark hover shadows separately — light mode shadows are invisible in dark mode
- Use `/` opacity modifiers that work in both modes (e.g., `ring-black/[0.04] dark:ring-white/[0.06]`)
- Never hardcode `rgb()` colors in component classes for surfaces — use tokens

---

## File Organization

```
src/
  components/
    ui/              # shadcn primitives (button, card, table, dialog, etc.)
    page-header.tsx  # shared page header
    status-badge.tsx # shared status indicator
    detail-row.tsx   # shared label-value pair
    theme-toggle.tsx # dark mode toggle
    app-command-menu.tsx  # cmd+k command palette
  ribs/
    [feature]/
      rib.ts         # Rib definition, view model hook
      views/
        [feature]-view.tsx  # main view component
  styles/
    globals.css      # all design tokens, base styles, animations
```
