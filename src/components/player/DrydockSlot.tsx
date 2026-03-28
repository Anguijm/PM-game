"use client";

import type { StagedWorkSlot, LaborDie } from "@/game/types";
import { WorkOrderCard } from "@/components/cards/WorkOrderCard";
import { cn } from "@/lib/cn";

interface DrydockSlotProps {
  slot: StagedWorkSlot;
  slotIndex: number;
  diceMap: Map<string, LaborDie>;
  onClick?: () => void;
  selected?: boolean;
  onRequirementClick?: (requirementIndex: number) => void;
  selectedReqIndex?: number | null;
}

export function DrydockSlot({
  slot,
  slotIndex,
  diceMap,
  onClick,
  selected = false,
  onRequirementClick,
  selectedReqIndex,
}: DrydockSlotProps) {
  if (!slot.card) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={!onClick}
        className={cn(
          "rounded-lg border-2 border-dashed p-3 min-h-[120px] flex items-center justify-center transition-all",
          selected
            ? "border-amber-500 bg-amber-500/10"
            : onClick
              ? "border-navy-600/50 bg-navy-900/50 hover:border-navy-400 hover:bg-navy-800/50 cursor-pointer"
              : "border-navy-600/50 bg-navy-900/50 cursor-default"
        )}
      >
        <span className="text-xs text-navy-600">
          Empty Slot {slotIndex + 1}
        </span>
      </button>
    );
  }

  // O(1) dice lookups via pre-computed map
  const assignedDiceInfo = slot.card.laborRequirements.map((_req, ri) => {
    const dieID = slot.assignedDice[ri];
    if (!dieID) return { filled: false };
    const die = diceMap.get(dieID);
    if (die) return { filled: true, currentValue: die.value };
    return { filled: false };
  });

  return (
    <div
      className={cn(
        "rounded-lg border p-3 min-h-[120px] transition-all",
        selected
          ? "border-amber-500 bg-amber-500/10"
          : "border-navy-600 bg-navy-800"
      )}
    >
      <WorkOrderCard card={slot.card} assignedDice={assignedDiceInfo} />

      {onRequirementClick && (
        <div className="mt-2 flex flex-wrap gap-1">
          {slot.card.laborRequirements.map((req, ri) => {
            const info = assignedDiceInfo[ri];
            if (info.filled) return null;
            return (
              <button
                key={ri}
                type="button"
                onClick={() => onRequirementClick(ri)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded text-xs font-bold border-2 border-dashed cursor-pointer transition-all hover:opacity-100 hover:scale-110",
                  selectedReqIndex === ri
                    ? "ring-2 ring-amber-400 opacity-100"
                    : "opacity-70"
                )}
                style={{
                  borderColor: `var(--color-die-${req.color})`,
                  color: `var(--color-die-${req.color})`,
                }}
                title={`Assign ${req.color} die here (${req.time} rounds)`}
              >
                {req.time}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
