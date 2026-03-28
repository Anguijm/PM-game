"use client";

import { useState } from "react";
import type { DrydockMastersState } from "@/game/types";
import { GAME_CONSTANTS } from "@/game/types";
import { TradeModal } from "@/components/ui/TradeModal";
import { useGameUI } from "@/hooks/useGameUI";
import { cn } from "@/lib/cn";

interface ActionPhaseViewProps {
  G: DrydockMastersState;
  playerID: string;
  isActive: boolean;
  moves: Record<string, (...args: any[]) => void>;
}

export function ActionPhaseView({
  G,
  playerID,
  isActive,
  moves,
}: ActionPhaseViewProps) {
  const player = G.players[playerID];
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showOvertimeSelect, setShowOvertimeSelect] = useState(false);
  const [showCoordinateSelect, setShowCoordinateSelect] = useState(false);
  const { startCoordinatingLabor, actionMode, cancelAction, showToast } = useGameUI();

  if (!isActive) {
    return (
      <div className="rounded-lg border border-success/30 bg-navy-800 p-4 text-center">
        <p className="text-sm text-navy-400">
          Waiting for the active player to take actions...
        </p>
      </div>
    );
  }

  if (player.hasPassed) {
    return (
      <div className="rounded-lg border border-navy-600 bg-navy-800 p-4 text-center">
        <p className="text-sm text-navy-400">
          You have passed. Waiting for other players...
        </p>
      </div>
    );
  }

  const hasActions = player.actionsRemaining > 0;
  const canAnalyzeMarket =
    hasActions && player.funding >= GAME_CONSTANTS.ANALYZE_MARKET_COST;
  const hasPersistentProblems = G.persistentProblems.length > 0;

  // Find assigned dice for overtime targeting
  const assignedDice = player.dice.filter(
    (d) => d.assignedToSlot !== null && d.value !== null && d.value > 0
  );

  // Find available dice for coordinating
  const availableDice = player.dice.filter(
    (d) => d.holderID === playerID && d.assignedToSlot === null
  );

  // Other players for trade/coordinate
  const otherPlayersList = Object.values(G.players).filter(
    (p) => p.id !== playerID
  );

  return (
    <>
      <div className="rounded-lg border border-success/30 bg-navy-800 p-4 space-y-3" data-tutorial="action-buttons">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-success uppercase tracking-wider">
            Action Phase — {player.actionsRemaining} action
            {player.actionsRemaining !== 1 ? "s" : ""} remaining
          </h3>
        </div>

        <p className="text-xs text-navy-400">
          Click cards in your hand then click empty slots to stage work.
          Click dice in your pool then click requirement slots to assign labor.
        </p>

        {/* Primary actions */}
        <div className="flex flex-wrap gap-2">
          <ActionButton
            label="Procurement: $4"
            disabled={!hasActions}
            onClick={() => moves.procurement?.("funding")}
          />
          <ActionButton
            label="Procurement: 2M"
            disabled={!hasActions}
            onClick={() => moves.procurement?.("material")}
          />
          <ActionButton
            label={`Analyze Market ($${GAME_CONSTANTS.ANALYZE_MARKET_COST})`}
            disabled={!canAnalyzeMarket}
            onClick={() => moves.analyzeMarket?.()}
          />
          {hasPersistentProblems &&
            G.persistentProblems.map((problem, i) => (
              <ActionButton
                key={problem.id}
                label={`Clear: ${problem.name}`}
                disabled={!hasActions}
                onClick={() => moves.clearObstruction?.(i)}
                variant="danger"
              />
            ))}
        </div>

        {/* Free actions */}
        <div className="border-t border-navy-600 pt-2">
          <h4 className="text-xs text-navy-400 uppercase tracking-wider mb-2">
            Free Actions
          </h4>
          <div className="flex flex-wrap gap-2">
            <ActionButton
              label="Trade Resources"
              onClick={() => setShowTradeModal(true)}
              disabled={otherPlayersList.length === 0}
              variant="default"
            />
            {availableDice.length > 0 && otherPlayersList.length > 0 && !showCoordinateSelect && (
              <ActionButton
                label="Coordinate (Loan Die)"
                disabled={!hasActions}
                onClick={() => {
                  if (otherPlayersList.length === 1) {
                    // 2-player game: auto-target
                    moves.coordinate?.(availableDice[0].id, otherPlayersList[0].id);
                  } else {
                    setShowCoordinateSelect(true);
                  }
                }}
              />
            )}
            {showCoordinateSelect && (
              <div className="w-full rounded border border-success/30 bg-success/10 p-2 space-y-2">
                <p className="text-xs text-success">
                  Select a player to loan a die to:
                </p>
                <div className="flex flex-wrap gap-1">
                  {otherPlayersList.map((target) => (
                    <button
                      key={target.id}
                      onClick={() => {
                        moves.coordinate?.(availableDice[0].id, target.id);
                        setShowCoordinateSelect(false);
                      }}
                      className="rounded px-2 py-1 text-xs font-bold bg-success/20 text-success hover:bg-success/30 border border-success/30"
                    >
                      {target.name}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowCoordinateSelect(false)}
                    className="rounded px-2 py-1 text-xs font-bold bg-navy-600 text-steel-300 hover:bg-navy-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Team Actions */}
        <div className="border-t border-navy-600 pt-2">
          <h4 className="text-xs text-navy-400 uppercase tracking-wider mb-2">
            Team Actions (cost SI — once per round, needs team consent)
          </h4>
          <div className="flex flex-wrap gap-2">
            {!showOvertimeSelect ? (
              <ActionButton
                label={`Emergency Overtime (-${GAME_CONSTANTS.EMERGENCY_OVERTIME_SI} SI)`}
                disabled={
                  G.teamActionsUsedThisRound.emergencyOvertime ||
                  G.shipyardIntegrity < GAME_CONSTANTS.EMERGENCY_OVERTIME_SI ||
                  assignedDice.length === 0
                }
                onClick={() => setShowOvertimeSelect(true)}
                variant="danger"
              />
            ) : (
              <div className="w-full rounded border border-alert-red/30 bg-alert-red/10 p-2 space-y-2">
                <p className="text-xs text-alert-red">
                  Select a die to speed up (-1 countdown, costs{" "}
                  {GAME_CONSTANTS.EMERGENCY_OVERTIME_SI} SI):
                </p>
                <div className="flex flex-wrap gap-1">
                  {assignedDice.map((die) => (
                    <button
                      key={die.id}
                      onClick={() => {
                        moves.emergencyOvertime?.(playerID, die.id);
                        setShowOvertimeSelect(false);
                      }}
                      className="rounded px-2 py-1 text-xs font-bold bg-alert-red/20 text-alert-red hover:bg-alert-red/30 border border-alert-red/30"
                    >
                      {die.color[0].toUpperCase()} (val:{die.value})
                    </button>
                  ))}
                  <button
                    onClick={() => setShowOvertimeSelect(false)}
                    className="rounded px-2 py-1 text-xs font-bold bg-navy-600 text-steel-300 hover:bg-navy-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            <ActionButton
              label={`Expedited Shipping (-${GAME_CONSTANTS.EXPEDITED_SHIPPING_SI} SI, +2M)`}
              disabled={
                G.teamActionsUsedThisRound.expeditedShipping ||
                G.shipyardIntegrity < GAME_CONSTANTS.EXPEDITED_SHIPPING_SI
              }
              onClick={() => moves.expeditedShipping?.()}
              variant="danger"
            />
          </div>
        </div>

        {/* Pass */}
        <div className="border-t border-navy-600 pt-2 flex justify-end">
          <ActionButton
            label="Pass Turn"
            onClick={() => moves.pass?.()}
            variant="muted"
          />
        </div>
      </div>

      {/* Trade Modal */}
      <TradeModal
        G={G}
        playerID={playerID}
        isOpen={showTradeModal}
        onClose={() => setShowTradeModal(false)}
        onTrade={(target, oF, oM, rF, rM) => {
          moves.trade?.(target, oF, oM, rF, rM);
        }}
      />
    </>
  );
}

function ActionButton({
  label,
  onClick,
  disabled = false,
  variant = "default",
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "danger" | "muted";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded px-3 py-1.5 text-xs font-bold transition-colors",
        disabled && "opacity-40 cursor-not-allowed",
        !disabled &&
          variant === "default" &&
          "bg-success/20 text-success hover:bg-success/30 border border-success/30",
        !disabled &&
          variant === "danger" &&
          "bg-alert-red/20 text-alert-red hover:bg-alert-red/30 border border-alert-red/30",
        !disabled &&
          variant === "muted" &&
          "bg-navy-600 text-steel-300 hover:bg-navy-500",
        disabled &&
          "bg-navy-700 text-navy-500 border border-navy-600"
      )}
    >
      {label}
    </button>
  );
}
