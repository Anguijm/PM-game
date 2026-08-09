import { DieColor, SI_THRESHOLDS } from "@/game/types";

export const DIE_COLORS: Record<
  DieColor,
  { bg: string; text: string; label: string; border: string }
> = {
  [DieColor.Red]: {
    bg: "bg-die-red",
    text: "text-white",
    label: "Hull",
    border: "border-die-red",
  },
  [DieColor.Blue]: {
    bg: "bg-die-blue",
    text: "text-white",
    label: "Engineering",
    border: "border-die-blue",
  },
  [DieColor.Yellow]: {
    bg: "bg-die-yellow",
    text: "text-navy-900",
    label: "Electrical",
    border: "border-die-yellow",
  },
  [DieColor.Green]: {
    bg: "bg-die-green",
    text: "text-white",
    label: "Combat Systems",
    border: "border-die-green",
  },
  [DieColor.Gray]: {
    bg: "bg-die-gray",
    text: "text-white",
    label: "Support",
    border: "border-die-gray",
  },
};

export function getSIColor(si: number): {
  bg: string;
  border: string;
  text: string;
  label: string;
} {
  if (si < SI_THRESHOLDS.EMERGENCY_MEASURES) {
    return {
      bg: "bg-alert-red/40",
      border: "border-alert-red",
      text: "text-alert-red",
      label: "EMERGENCY",
    };
  }
  if (si < SI_THRESHOLDS.SUPPLY_CHAIN_SKEPTICISM) {
    return {
      bg: "bg-alert-red/20",
      border: "border-alert-red",
      text: "text-alert-red",
      label: "DANGER",
    };
  }
  if (si < SI_THRESHOLDS.INCREASED_OVERSIGHT) {
    return {
      bg: "bg-amber-500/20",
      border: "border-amber-500",
      text: "text-amber-400",
      label: "CAUTION",
    };
  }
  return {
    bg: "bg-success/20",
    border: "border-success",
    text: "text-success",
    label: "NOMINAL",
  };
}

/** Raw hex + status label for SVG/canvas use (the SI gauge). */
export function getSIHex(si: number): { stroke: string; glow: string; label: string } {
  if (si < SI_THRESHOLDS.EMERGENCY_MEASURES) {
    return { stroke: "#ef4444", glow: "rgba(239,68,68,0.55)", label: "EMERGENCY" };
  }
  if (si < SI_THRESHOLDS.SUPPLY_CHAIN_SKEPTICISM) {
    return { stroke: "#ef4444", glow: "rgba(239,68,68,0.45)", label: "DANGER" };
  }
  if (si < SI_THRESHOLDS.INCREASED_OVERSIGHT) {
    return { stroke: "#f59e0b", glow: "rgba(245,158,11,0.5)", label: "CAUTION" };
  }
  return { stroke: "#22c55e", glow: "rgba(34,197,94,0.5)", label: "NOMINAL" };
}

export const PHASE_LABELS: Record<string, { label: string; color: string }> = {
  contractSelection: { label: "CONTRACT SELECTION", color: "text-amber-400" },
  event: { label: "EVENT", color: "text-amber-400" },
  planning: { label: "PLANNING", color: "text-die-blue" },
  action: { label: "ACTION", color: "text-success" },
  resolution: { label: "RESOLUTION", color: "text-prestige" },
};
