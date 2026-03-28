"use client";

import type { ForemanCard as ForemanCardType } from "@/game/types";

interface ForemanCardProps {
  card: ForemanCardType;
  onClick?: () => void;
  disabled?: boolean;
}

export function ForemanCard({ card, onClick, disabled }: ForemanCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !onClick}
      className={`rounded-lg border px-3 py-2 text-left transition-colors ${
        onClick && !disabled
          ? "border-navy-600 bg-navy-700 hover:border-prestige hover:bg-navy-600 cursor-pointer"
          : "border-navy-600/50 bg-navy-700/50 opacity-50 cursor-not-allowed"
      }`}
    >
      <div className="text-xs font-bold text-prestige">{card.name}</div>
      <p className="mt-0.5 text-[10px] text-navy-400">{card.description}</p>
    </button>
  );
}
