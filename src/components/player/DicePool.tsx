"use client";

import type { LaborDie as LaborDieType } from "@/game/types";
import { LaborDie } from "@/components/dice/LaborDie";
import { useGameUI } from "@/hooks/useGameUI";

interface DicePoolProps {
  dice: LaborDieType[];
  playerID: string;
  isActive: boolean;
}

export function DicePool({ dice, playerID, isActive }: DicePoolProps) {
  const { actionMode, startAssigningLabor, cancelAction } = useGameUI();

  const availableDice = dice.filter(
    (d) => d.holderID === playerID && d.assignedToSlot === null
  );

  const selectedDieID =
    actionMode.type === "assigningLabor" ? actionMode.dieID : null;

  function handleDieClick(dieID: string) {
    if (!isActive) return;
    if (selectedDieID === dieID) {
      cancelAction();
    } else {
      startAssigningLabor(dieID);
    }
  }

  return (
    <div className="rounded-lg border border-navy-600 bg-navy-800 p-3">
      <h3 className="text-xs text-navy-400 uppercase tracking-wider mb-2">
        Available Labor ({availableDice.length})
        {selectedDieID && (
          <span className="text-amber-400 ml-2">— die selected, click requirement slot</span>
        )}
      </h3>
      <div className="flex flex-wrap gap-2">
        {availableDice.map((die) => (
          <LaborDie
            key={die.id}
            die={die}
            selected={selectedDieID === die.id}
            onClick={isActive ? () => handleDieClick(die.id) : undefined}
            showValue={false}
          />
        ))}
        {availableDice.length === 0 && (
          <span className="text-xs text-navy-600">All labor assigned</span>
        )}
      </div>
    </div>
  );
}
