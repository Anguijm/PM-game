"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

interface PlayerSwitcherProps {
  numPlayers: number;
  activePlayerID: string;
  currentTurnPlayerID: string;
  onSwitch: (playerID: string) => void;
}

export function PlayerSwitcher({
  numPlayers,
  activePlayerID,
  currentTurnPlayerID,
  onSwitch,
}: PlayerSwitcherProps) {
  const [showPassDevice, setShowPassDevice] = useState(false);
  const [pendingPlayerID, setPendingPlayerID] = useState<string | null>(null);

  // Auto-trigger Pass Device when turn changes and active view doesn't match
  useEffect(() => {
    if (currentTurnPlayerID !== activePlayerID && !showPassDevice) {
      setPendingPlayerID(currentTurnPlayerID);
      setShowPassDevice(true);
    }
  }, [currentTurnPlayerID, activePlayerID, showPassDevice]);

  function handleSwitch(pid: string) {
    if (pid === activePlayerID) return;
    setPendingPlayerID(pid);
    setShowPassDevice(true);
  }

  function confirmSwitch() {
    if (pendingPlayerID !== null) {
      onSwitch(pendingPlayerID);
    }
    setShowPassDevice(false);
    setPendingPlayerID(null);
  }

  const safeNumPlayers = Math.max(0, numPlayers || 0);

  return (
    <>
      <div className="flex border-b border-navy-600 bg-navy-900">
        {Array.from({ length: safeNumPlayers }, (_, i) => String(i)).map(
          (pid) => {
            const isCurrentTurn = currentTurnPlayerID === pid;
            const isViewing = activePlayerID === pid;

            return (
              <button
                key={pid}
                onClick={() => handleSwitch(pid)}
                tabIndex={showPassDevice ? -1 : 0}
                aria-disabled={showPassDevice}
                className={cn(
                  "flex-1 py-2 text-sm font-bold uppercase tracking-wider transition-colors",
                  isViewing
                    ? "bg-navy-700 text-steel-100 border-b-2 border-amber-500"
                    : "text-navy-400 hover:text-navy-200 hover:bg-navy-800",
                  isCurrentTurn &&
                    !isViewing &&
                    "ring-1 ring-inset ring-amber-500/30"
                )}
              >
                Player {parseInt(pid) + 1}
                {isCurrentTurn && " *"}
              </button>
            );
          }
        )}
      </div>

      {/* Pass Device overlay — rendered via portal, 100% opaque */}
      {showPassDevice &&
        pendingPlayerID !== null &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-navy-950"
            role="dialog"
            aria-modal="true"
          >
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-bold text-steel-100">
                Pass to Player {parseInt(pendingPlayerID) + 1}
              </h2>
              <p className="text-navy-400">
                Hand the device to the next player, then tap below.
              </p>
              <button
                onClick={confirmSwitch}
                autoFocus
                className="rounded-lg bg-amber-500 px-8 py-3 text-lg font-bold text-navy-900 hover:bg-amber-400 transition-colors"
              >
                I&apos;M PLAYER {parseInt(pendingPlayerID) + 1} — READY
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
