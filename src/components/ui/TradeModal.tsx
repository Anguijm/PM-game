"use client";

import { useState } from "react";
import type { DrydockMastersState } from "@/game/types";
import { cn } from "@/lib/cn";

interface TradeModalProps {
  G: DrydockMastersState;
  playerID: string;
  isOpen: boolean;
  onClose: () => void;
  onTrade: (
    targetPlayerID: string,
    offerFunding: number,
    offerMaterial: number,
    requestFunding: number,
    requestMaterial: number
  ) => void;
}

export function TradeModal({
  G,
  playerID,
  isOpen,
  onClose,
  onTrade,
}: TradeModalProps) {
  const [targetID, setTargetID] = useState<string>("");
  const [offerFunding, setOfferFunding] = useState(0);
  const [offerMaterial, setOfferMaterial] = useState(0);
  const [requestFunding, setRequestFunding] = useState(0);
  const [requestMaterial, setRequestMaterial] = useState(0);

  if (!isOpen) return null;

  const player = G.players[playerID];
  const otherPlayers = Object.values(G.players).filter(
    (p) => p.id !== playerID
  );

  // Auto-select first opponent if none selected
  const effectiveTarget = targetID || otherPlayers[0]?.id || "";
  const targetPlayer = G.players[effectiveTarget];

  const canSubmit =
    effectiveTarget &&
    (offerFunding + offerMaterial + requestFunding + requestMaterial > 0) &&
    offerFunding <= player.funding &&
    offerMaterial <= player.material &&
    (!targetPlayer ||
      (requestFunding <= targetPlayer.funding &&
        requestMaterial <= targetPlayer.material));

  function handleSubmit() {
    if (!canSubmit) return;
    onTrade(
      effectiveTarget,
      offerFunding,
      offerMaterial,
      requestFunding,
      requestMaterial
    );
    // Reset
    setOfferFunding(0);
    setOfferMaterial(0);
    setRequestFunding(0);
    setRequestMaterial(0);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-navy-950/80">
      <div className="rounded-xl border border-navy-600 bg-navy-800 p-6 max-w-md w-full mx-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-steel-100 uppercase tracking-wider">
            Trade Resources
          </h3>
          <button
            onClick={onClose}
            className="text-navy-400 hover:text-steel-100 text-lg"
          >
            &times;
          </button>
        </div>

        {/* Target player */}
        <div>
          <label className="text-xs text-navy-400 uppercase">Trade with</label>
          <div className="flex gap-2 mt-1">
            {otherPlayers.map((p) => (
              <button
                key={p.id}
                onClick={() => setTargetID(p.id)}
                className={cn(
                  "flex-1 rounded py-1.5 text-xs font-bold transition-colors",
                  (effectiveTarget === p.id)
                    ? "bg-amber-500 text-navy-900"
                    : "bg-navy-700 text-navy-200 hover:bg-navy-600"
                )}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* You offer */}
        <div className="space-y-2">
          <label className="text-xs text-navy-400 uppercase">You offer</label>
          <div className="flex gap-3">
            <NumberInput
              label="$"
              value={offerFunding}
              onChange={setOfferFunding}
              max={player.funding}
              color="text-funding"
            />
            <NumberInput
              label="M"
              value={offerMaterial}
              onChange={setOfferMaterial}
              max={player.material}
              color="text-material"
            />
          </div>
        </div>

        {/* You request */}
        <div className="space-y-2">
          <label className="text-xs text-navy-400 uppercase">You request</label>
          <div className="flex gap-3">
            <NumberInput
              label="$"
              value={requestFunding}
              onChange={setRequestFunding}
              max={targetPlayer?.funding ?? 0}
              color="text-funding"
            />
            <NumberInput
              label="M"
              value={requestMaterial}
              onChange={setRequestMaterial}
              max={targetPlayer?.material ?? 0}
              color="text-material"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={cn(
            "w-full rounded py-2 text-sm font-bold transition-colors",
            canSubmit
              ? "bg-amber-500 text-navy-900 hover:bg-amber-400"
              : "bg-navy-700 text-navy-500 cursor-not-allowed"
          )}
        >
          EXECUTE TRADE
        </button>
      </div>
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  max,
  color,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 flex-1">
      <span className={cn("font-bold text-sm", color)}>{label}</span>
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={value <= 0}
        className="rounded bg-navy-600 px-2 py-0.5 text-xs font-bold text-steel-300 hover:bg-navy-500 disabled:opacity-30"
      >
        -
      </button>
      <span className="text-sm font-bold text-steel-100 w-6 text-center">
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="rounded bg-navy-600 px-2 py-0.5 text-xs font-bold text-steel-300 hover:bg-navy-500 disabled:opacity-30"
      >
        +
      </button>
    </div>
  );
}
