import { cn } from "@/lib/utils";

type OrbVariant = "hero" | "cta" | "workflow" | "default";

const variantOrbs: Record<
  OrbVariant,
  Array<{
    className: string;
    style: React.CSSProperties;
  }>
> = {
  hero: [
    {
      className:
        "absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full opacity-40 blur-[120px]",
      style: { background: "var(--orb-1)" },
    },
    {
      className:
        "absolute top-1/2 -left-32 h-[400px] w-[400px] rounded-full opacity-35 blur-[100px]",
      style: { background: "var(--orb-2)" },
    },
    {
      className:
        "absolute bottom-0 right-1/3 h-[350px] w-[350px] rounded-full opacity-30 blur-[100px]",
      style: { background: "var(--orb-3)" },
    },
  ],
  cta: [
    {
      className:
        "absolute -bottom-20 left-1/4 h-[400px] w-[400px] rounded-full opacity-35 blur-[100px]",
      style: { background: "var(--orb-2)" },
    },
    {
      className:
        "absolute top-0 right-1/4 h-[300px] w-[300px] rounded-full opacity-25 blur-[80px]",
      style: { background: "var(--orb-1)" },
    },
  ],
  workflow: [
    {
      className:
        "absolute -top-20 -right-20 h-[380px] w-[380px] rounded-full opacity-40 blur-[100px]",
      style: { background: "var(--orb-1)" },
    },
    {
      className:
        "absolute -bottom-20 -left-20 h-[320px] w-[320px] rounded-full opacity-35 blur-[90px]",
      style: { background: "var(--orb-2)" },
    },
    {
      className:
        "absolute top-1/2 left-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-[80px]",
      style: { background: "var(--orb-3)" },
    },
  ],
  default: [
    {
      className:
        "absolute top-0 right-0 h-[400px] w-[400px] rounded-full opacity-30 blur-[100px]",
      style: { background: "var(--orb-1)" },
    },
    {
      className:
        "absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full opacity-25 blur-[80px]",
      style: { background: "var(--orb-2)" },
    },
  ],
};

export interface OrbSurfaceProps {
  variant?: OrbVariant;
  className?: string;
  children?: React.ReactNode;
}

/**
 * A surface that renders glowing orbular gradients as a background layer.
 * Use as a wrapper; content should be in a child with `relative` so it stacks above the orbs.
 */
export function OrbSurface({
  variant = "default",
  className,
  children,
}: OrbSurfaceProps) {
  const orbs = variantOrbs[variant];

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      aria-hidden={!children}
    >
      {orbs.map((orb, i) => (
        <div
          key={i}
          className={cn("pointer-events-none", orb.className)}
          style={orb.style}
        />
      ))}
      {children}
    </div>
  );
}
