"use client";

import { useGameUI } from "@/hooks/useGameUI";

export function ActionModeBar() {
  const { actionMode, cancelAction } = useGameUI();

  if (actionMode.type === "idle") return null;

  const messages: Record<string, string> = {
    stagingWork: "Select an empty slot to stage this work order",
    assigningLabor: "Select a labor requirement slot to assign this die",
    coordinatingLabor: "Select a player to loan this die to",
  };

  return (
    <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 flex items-center justify-between">
      <span className="text-sm text-amber-400">
        {messages[actionMode.type]}
      </span>
      <button
        onClick={cancelAction}
        className="rounded bg-navy-600 px-3 py-1 text-xs font-bold text-steel-300 hover:bg-navy-500 transition-colors"
      >
        CANCEL
      </button>
    </div>
  );
}
