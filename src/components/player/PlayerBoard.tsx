"use client";

import { useEffect } from "react";
import type { PlayerState, LaborDie } from "@/game/types";
import { ResourceBar } from "./ResourceBar";
import { DicePool } from "./DicePool";
import { DrydockSlot } from "./DrydockSlot";
import { useGameUI } from "@/hooks/useGameUI";

interface PlayerBoardProps {
  player: PlayerState;
  diceMap: Map<string, LaborDie>;
  isActive: boolean;
  moves: Record<string, (...args: any[]) => void>;
}

export function PlayerBoard({
  player,
  diceMap,
  isActive,
  moves,
}: PlayerBoardProps) {
  const { actionMode, cancelAction, showToast } = useGameUI();

  // Reset action mode when turn ends or player changes
  useEffect(() => {
    if (!isActive) cancelAction();
  }, [isActive, cancelAction]);

  function handleSlotClick(slotIndex: number) {
    if (!isActive || actionMode.type !== "stagingWork") return;

    const card = player.hand.find((c) => c.id === actionMode.cardID);

    if (!card) {
      showToast("Selected card no longer in hand");
      cancelAction();
      return;
    }
    if (player.actionsRemaining <= 0) {
      showToast("No actions remaining");
      return; // Keep card selected so they can try after gaining actions
    }
    if (player.material < card.materialCost) {
      showToast(
        `Not enough material (need ${card.materialCost}, have ${player.material})`
      );
      return;
    }

    moves.stageWork?.(actionMode.cardID, slotIndex);
    cancelAction();
  }

  function handleRequirementClick(slotIndex: number, reqIndex: number) {
    if (!isActive || actionMode.type !== "assigningLabor") return;

    // Verify die still exists and is available
    const die = player.dice.find(
      (d) => d.id === actionMode.dieID && d.assignedToSlot === null
    );
    if (!die) {
      showToast("Selected die no longer available");
      cancelAction();
      return;
    }
    if (player.actionsRemaining <= 0) {
      showToast("No actions remaining");
      return;
    }
    if (player.funding < 1) {
      showToast("Not enough funding for wages");
      return;
    }

    moves.assignLabor?.(actionMode.dieID, slotIndex, reqIndex);
    cancelAction();
  }

  const isStagingMode = actionMode.type === "stagingWork";
  const isAssigningMode = actionMode.type === "assigningLabor";

  return (
    <div className="space-y-3">
      <ResourceBar
        funding={player.funding}
        material={player.material}
        pp={player.pp}
        actionsRemaining={player.actionsRemaining}
        hasPassed={player.hasPassed}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {player.stagedSlots.map((slot, i) => (
          <DrydockSlot
            key={slot.id}
            slot={slot}
            slotIndex={i}
            diceMap={diceMap}
            onClick={
              isStagingMode && !slot.card && isActive
                ? () => handleSlotClick(i)
                : undefined
            }
            selected={isStagingMode && !slot.card}
            onRequirementClick={
              isAssigningMode && slot.card && isActive
                ? (reqIndex) => handleRequirementClick(i, reqIndex)
                : undefined
            }
            selectedReqIndex={null}
          />
        ))}
      </div>

      <DicePool
        dice={player.dice}
        playerID={player.id}
        isActive={isActive}
      />
    </div>
  );
}
