"use client";

import type { WorkOrderCard as WOCardType } from "@/game/types";
import { WorkOrderCard } from "@/components/cards/WorkOrderCard";

interface PlanningPhaseViewProps {
  market: WOCardType[];
  isActive: boolean;
  onDraftCard: (marketIndex: number) => void;
}

export function PlanningPhaseView({
  market,
  isActive,
  onDraftCard,
}: PlanningPhaseViewProps) {
  if (!isActive) {
    return (
      <div className="rounded-lg border border-die-blue/30 bg-navy-800 p-4 text-center">
        <p className="text-sm text-navy-400">
          Waiting for the active player to draft...
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-die-blue/30 bg-navy-800 p-4">
      <h3 className="text-sm font-bold text-die-blue uppercase tracking-wider mb-3">
        Draft Phase — Select one work order
      </h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {market.map((card, i) => (
          <WorkOrderCard
            key={card.id}
            card={card}
            size="full"
            onClick={() => onDraftCard(i)}
          />
        ))}
      </div>
      {market.length === 0 && (
        <p className="text-sm text-navy-400">Market is empty.</p>
      )}
    </div>
  );
}
