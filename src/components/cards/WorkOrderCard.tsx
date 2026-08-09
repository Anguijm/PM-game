"use client";

import { motion } from "framer-motion";
import type { WorkCard } from "@/game/types";
import { LaborRequirementSlot } from "@/components/dice/LaborDie";

interface WorkOrderCardProps {
  card: WorkCard;
  size?: "full" | "compact";
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  /** Assigned dice info for staged cards */
  assignedDice?: Array<{
    filled: boolean;
    currentValue?: number | null;
  }>;
}

export function WorkOrderCard({
  card,
  size = "full",
  onClick,
  selected = false,
  disabled = false,
  assignedDice,
}: WorkOrderCardProps) {
  const isCompact = size === "compact";
  const category = "category" in card ? card.category : undefined;

  return (
    <motion.div
      role={onClick ? "button" : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      onClick={onClick && !disabled ? onClick : undefined}
      whileHover={onClick && !disabled ? { y: -3 } : undefined}
      transition={{ duration: 0.15 }}
      className={`text-left transition-all ${
        isCompact ? "px-3 py-2" : "p-3"
      } ${
        selected
          ? "rounded-lg border border-amber-500 bg-amber-500/10 ring-1 ring-amber-500"
          : disabled
            ? "dm-panel opacity-50 cursor-not-allowed"
            : onClick
              ? "dm-panel hover:border-navy-400 cursor-pointer"
              : "dm-panel cursor-default"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h4
          className={`font-bold text-steel-100 ${
            isCompact ? "text-xs" : "text-sm"
          }`}
        >
          {card.name}
        </h4>
        {card.isHighProfile && (
          <span className="shrink-0 rounded bg-amber-500/20 px-1 py-0.5 text-[10px] font-bold text-amber-400 uppercase">
            HP
          </span>
        )}
      </div>

      {/* Stats */}
      <div
        className={`flex items-center gap-2 text-navy-400 ${
          isCompact ? "mt-0.5 text-[10px]" : "mt-1 text-xs"
        }`}
      >
        {card.materialCost > 0 && (
          <span className="text-material">{card.materialCost}M</span>
        )}
        <span className="text-prestige">{card.prestigeValue}PP</span>
        {category && (
          <span className="text-navy-400/60 capitalize">{category}</span>
        )}
      </div>

      {/* Labor Requirements */}
      {!isCompact && (
        <div className="mt-2 flex flex-wrap gap-1">
          {card.laborRequirements.map((req, i) => {
            const dieInfo = assignedDice?.[i];
            return (
              <LaborRequirementSlot
                key={i}
                color={req.color}
                time={req.time}
                filled={dieInfo?.filled ?? false}
                currentValue={dieInfo?.currentValue}
              />
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
