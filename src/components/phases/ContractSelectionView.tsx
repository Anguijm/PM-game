"use client";

import type { ShipContractCard, PlayerState } from "@/game/types";
import { DIE_COLORS } from "@/lib/theme";
import { cn } from "@/lib/cn";

interface ContractSelectionViewProps {
  player: PlayerState;
  isActive: boolean;
  onSelect: (contractID: string) => void;
}

export function ContractSelectionView({
  player,
  isActive,
  onSelect,
}: ContractSelectionViewProps) {
  if (player.contract) {
    return (
      <div className="rounded-lg border border-success/30 bg-navy-800 p-4 text-center">
        <p className="text-sm text-success">
          Contract selected: <span className="font-bold">{player.contract.name}</span> (Side {player.contract.side})
        </p>
        <p className="text-xs text-navy-400 mt-1">
          Waiting for other players to choose...
        </p>
      </div>
    );
  }

  if (!isActive) {
    return (
      <div className="rounded-lg border border-navy-600 bg-navy-800 p-4 text-center">
        <p className="text-sm text-navy-400">
          Waiting for your turn to select a contract...
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-amber-500/30 bg-navy-800 p-4 space-y-4">
      <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider text-center">
        Choose Your Ship Contract
      </h3>
      <p className="text-xs text-navy-400 text-center">
        Side A is standard difficulty. Side B is complex with different dice and harder quotas.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {player.contractChoices.map((contract) => (
          <ContractOption
            key={contract.id}
            contract={contract}
            onSelect={() => onSelect(contract.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ContractOption({
  contract,
  onSelect,
}: {
  contract: ShipContractCard;
  onSelect: () => void;
}) {
  const isComplex = contract.side === "B";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "rounded-lg border p-4 text-left transition-all hover:scale-[1.02]",
        isComplex
          ? "border-alert-red/40 bg-alert-red/5 hover:border-alert-red/70"
          : "border-success/40 bg-success/5 hover:border-success/70"
      )}
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-steel-100">{contract.name}</h4>
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
            isComplex
              ? "bg-alert-red/20 text-alert-red"
              : "bg-success/20 text-success"
          )}
        >
          Side {contract.side} — {isComplex ? "Complex" : "Standard"}
        </span>
      </div>

      {/* Starting dice */}
      <div className="mt-3">
        <span className="text-xs text-navy-400">Starting Dice:</span>
        <div className="flex gap-1 mt-1">
          {contract.startingDice.map((color, i) => {
            const dc = DIE_COLORS[color];
            return (
              <div
                key={i}
                className={cn(
                  "h-7 w-7 rounded flex items-center justify-center text-[10px] font-bold",
                  dc.bg,
                  dc.text
                )}
              >
                {dc.label[0]}
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirm */}
      <div className="mt-3 text-center">
        <span
          className={cn(
            "text-xs font-bold uppercase",
            isComplex ? "text-alert-red" : "text-success"
          )}
        >
          Select This Contract
        </span>
      </div>
    </button>
  );
}
