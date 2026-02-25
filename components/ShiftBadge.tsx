import { clsx } from "clsx";
import type { ShiftType } from "@/types";

interface ShiftBadgeProps {
  shift: ShiftType | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SHIFT_CONFIG: Record<
  ShiftType,
  { label: string; bg: string; text: string; dot: string }
> = {
  frei: {
    label: "Frei",
    bg: "bg-white/[0.06]",
    text: "text-white/40",
    dot: "bg-white/30",
  },
  HO: {
    label: "HO",
    bg: "bg-accent-green/10",
    text: "text-green-400",
    dot: "bg-green-400",
  },
  Früh: {
    label: "Früh",
    bg: "bg-accent-orange/10",
    text: "text-orange-400",
    dot: "bg-orange-400",
  },
  Spät: {
    label: "Spät",
    bg: "bg-accent-purple/10",
    text: "text-purple-400",
    dot: "bg-purple-400",
  },
  Urlaub: {
    label: "Urlaub",
    bg: "bg-accent-blue/10",
    text: "text-blue-400",
    dot: "bg-blue-400",
  },
  MD: {
    label: "MD",
    bg: "bg-accent-red/10",
    text: "text-red-400",
    dot: "bg-red-400",
  },
};

export function ShiftBadge({
  shift,
  size = "md",
  className,
}: ShiftBadgeProps) {
  if (!shift) {
    return (
      <span
        className={clsx(
          "inline-flex items-center rounded-lg font-medium",
          size === "sm" && "text-xs px-2 py-0.5",
          size === "md" && "text-sm px-2.5 py-1",
          size === "lg" && "text-base px-3 py-1.5",
          "bg-white/[0.04] text-white/20",
          className
        )}
      >
        –
      </span>
    );
  }

  const config = SHIFT_CONFIG[shift];

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-lg font-semibold",
        size === "sm" && "text-xs px-2 py-0.5",
        size === "md" && "text-sm px-2.5 py-1",
        size === "lg" && "text-base px-3 py-1.5",
        config.bg,
        config.text,
        className
      )}
    >
      {config.label}
    </span>
  );
}

export function getShiftConfig(shift: ShiftType) {
  return SHIFT_CONFIG[shift];
}

export const SHIFT_TYPES: ShiftType[] = [
  "frei",
  "HO",
  "Früh",
  "Spät",
  "Urlaub",
  "MD",
];
