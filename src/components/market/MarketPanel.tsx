"use client";

import type { WorkOrderCard as WOCardType, ForemanCard as FMCardType } from "@/game/types";
import { WorkOrderCard } from "@/components/cards/WorkOrderCard";
import { ForemanCard } from "@/components/cards/ForemanCard";

interface MarketPanelProps {
  workOrderMarket: WOCardType[];
  foremanMarket: FMCardType[];
  isActive: boolean;
  phase: string;
  onDraftCard?: (marketIndex: number) => void;
  onHireForeman?: (foremanIndex: number) => void;
  canAffordForeman: boolean;
}

export function MarketPanel({
  workOrderMarket,
  foremanMarket,
  isActive,
  phase,
  onDraftCard,
  onHireForeman,
  canAffordForeman,
}: MarketPanelProps) {
  return (
    <div className="space-y-3">
      {/* Work Order Market */}
      {workOrderMarket.length > 0 && (
        <div
          className={`rounded-lg border bg-navy-800 p-3 ${
            phase === "planning"
              ? "border-die-blue/30"
              : "border-navy-600"
          }`}
        >
          <h3
            className={`text-xs uppercase tracking-wider mb-2 ${
              phase === "planning" ? "text-die-blue" : "text-navy-400"
            }`}
          >
            Work Order Market
            {phase === "planning" && " — Select one to draft"}
          </h3>
          <div className="flex flex-wrap gap-2">
            {workOrderMarket.map((card, i) => (
              <WorkOrderCard
                key={card.id}
                card={card}
                size="compact"
                onClick={
                  phase === "planning" && isActive && onDraftCard
                    ? () => onDraftCard(i)
                    : undefined
                }
                disabled={phase !== "planning" || !isActive}
              />
            ))}
          </div>
        </div>
      )}

      {/* Foreman Market */}
      {foremanMarket.length > 0 && (
        <div className="rounded-lg border border-navy-600 bg-navy-800 p-3">
          <h3 className="text-xs text-navy-400 uppercase tracking-wider mb-2">
            Foreman Market ($10)
          </h3>
          <div className="flex flex-wrap gap-2">
            {foremanMarket.map((card, i) => (
              <ForemanCard
                key={card.id}
                card={card}
                onClick={
                  isActive && canAffordForeman && onHireForeman
                    ? () => onHireForeman(i)
                    : undefined
                }
                disabled={!isActive || !canAffordForeman}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
