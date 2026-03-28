"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { LaborDie as LaborDieType } from "@/game/types";
import { DIE_COLORS } from "@/lib/theme";
import { cn } from "@/lib/cn";

interface LaborDieProps {
  die: LaborDieType;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  selected?: boolean;
  showValue?: boolean;
}

const SIZE_CLASSES = {
  sm: "h-7 w-7 text-xs rounded",
  md: "h-10 w-10 text-sm rounded-lg",
  lg: "h-12 w-12 text-base rounded-lg",
} as const;

export function LaborDie({
  die,
  size = "md",
  onClick,
  selected = false,
  showValue = true,
}: LaborDieProps) {
  const colors = DIE_COLORS[die.color];
  const label = die.color === "gray" ? "W" : die.color[0].toUpperCase();

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        SIZE_CLASSES[size],
        "flex items-center justify-center font-bold transition-all",
        colors.bg,
        colors.text,
        onClick
          ? "cursor-pointer hover:scale-110 hover:shadow-lg"
          : "cursor-default",
        selected &&
          "ring-2 ring-amber-400 ring-offset-2 ring-offset-navy-900 scale-110"
      )}
      title={`${colors.label}${die.value !== null ? ` (${die.value} rounds)` : ""}`}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={showValue && die.value !== null ? die.value : label}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {showValue && die.value !== null ? die.value : label}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

interface LaborRequirementSlotProps {
  color: string;
  time: number;
  filled: boolean;
  currentValue?: number | null;
  onClick?: () => void;
  selected?: boolean;
}

export function LaborRequirementSlot({
  color,
  time,
  filled,
  currentValue,
  onClick,
  selected = false,
}: LaborRequirementSlotProps) {
  if (filled) {
    return (
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded text-xs font-bold bg-success/30 text-success border border-success/50",
          selected && "ring-2 ring-amber-400"
        )}
      >
        {currentValue ?? 0}
      </div>
    );
  }

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded text-xs font-bold border-2 border-dashed opacity-70 transition-all",
        onClick
          ? "cursor-pointer hover:opacity-100 hover:scale-110"
          : "cursor-default",
        selected && "ring-2 ring-amber-400 opacity-100"
      )}
      style={{
        borderColor: `var(--color-die-${color})`,
        color: `var(--color-die-${color})`,
      }}
      title={`Requires ${color} die, ${time} rounds`}
    >
      {time}
    </div>
  );
}
