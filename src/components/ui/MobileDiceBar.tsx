"use client";

import type { PlayerState } from "@/game/types";
import { DIE_COLORS } from "@/lib/theme";

interface MobileDiceBarProps {
  player: PlayerState;
}

export function MobileDiceBar({ player }: MobileDiceBarProps) {
  const availableDice = player.dice.filter(
    (d) => d.holderID === player.id && d.assignedToSlot === null
  );

  return (
    <div
      className="flex items-center gap-2 bg-navy-800 border-b border-navy-600 px-3 py-1.5 sm:hidden overflow-x-auto"
      style={{ touchAction: "manipulation" }}
    >
      <span className="text-funding font-bold text-xs">${player.funding}</span>
      <span className="text-material font-bold text-xs">{player.material}M</span>
      <span className="text-prestige font-bold text-xs">{player.pp}PP</span>
      <span className="text-success font-bold text-xs">{player.actionsRemaining}A</span>
      <div className="h-4 w-px bg-navy-600 mx-1" />
      {availableDice.map((die) => {
        const colors = DIE_COLORS[die.color];
        return (
          <div
            key={die.id}
            className={`h-6 w-6 rounded text-[10px] font-bold flex items-center justify-center ${colors.bg} ${colors.text}`}
          >
            {die.color === "gray" ? "W" : die.color[0].toUpperCase()}
          </div>
        );
      })}
      {availableDice.length === 0 && (
        <span className="text-[10px] text-navy-600">all assigned</span>
      )}
    </div>
  );
}
