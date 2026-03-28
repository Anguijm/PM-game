"use client";

import { useState } from "react";
import type { WorkCard } from "@/game/types";
import { WorkOrderCard } from "@/components/cards/WorkOrderCard";
import { useGameUI } from "@/hooks/useGameUI";

interface HandPanelProps {
  hand: WorkCard[];
  isActive: boolean;
}

export function HandPanel({ hand, isActive }: HandPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { actionMode, startStagingWork, cancelAction } = useGameUI();

  if (hand.length === 0) return null;

  const selectedCardID =
    actionMode.type === "stagingWork" ? actionMode.cardID : null;

  function handleCardClick(cardID: string) {
    if (!isActive) return;
    if (selectedCardID === cardID) {
      cancelAction();
    } else {
      startStagingWork(cardID);
    }
  }

  return (
    <div className="rounded-lg border border-navy-600 bg-navy-800" data-tutorial="hand-panel">
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center justify-between p-3 text-left"
      >
        <h3 className="text-xs text-navy-400 uppercase tracking-wider">
          Available Work Package ({hand.length})
          {selectedCardID && (
            <span className="text-amber-400 ml-2">— card selected, click empty slot</span>
          )}
        </h3>
        <span className="text-navy-400 text-xs">
          {collapsed ? "▼" : "▲"}
        </span>
      </button>

      {!collapsed && (
        <div className="flex flex-wrap gap-2 px-3 pb-3">
          {hand.map((card) => (
            <WorkOrderCard
              key={card.id}
              card={card}
              size="compact"
              selected={selectedCardID === card.id}
              onClick={isActive ? () => handleCardClick(card.id) : undefined}
              disabled={!isActive}
            />
          ))}
        </div>
      )}
    </div>
  );
}
