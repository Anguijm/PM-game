"use client";

import type { PlayerState } from "@/game/types";

/**
 * A prominent "what to do right now" banner. Turns the current phase +
 * player state into a single plain-English instruction.
 */
export function PhasePrompt({
  phase,
  isActive,
  player,
}: {
  phase: string;
  isActive: boolean;
  player: PlayerState;
}) {
  const { text, tone } = getPrompt(phase, isActive, player);
  if (!text) return null;

  const toneClass =
    tone === "wait"
      ? "border-navy-600 bg-navy-800/70 text-navy-200"
      : tone === "warn"
        ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
        : "border-die-blue/40 bg-die-blue/10 text-steel-100";

  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${toneClass}`}>
      <span className="text-base leading-none">{tone === "wait" ? "⏳" : "➤"}</span>
      <p className="text-[13px] leading-snug sm:text-sm">
        <span className="stencil mr-1 text-[10px] opacity-70">Do this</span>
        {text}
      </p>
    </div>
  );
}

function getPrompt(
  phase: string,
  isActive: boolean,
  player: PlayerState,
): { text: string; tone: "do" | "wait" | "warn" } {
  if (!isActive) {
    return { text: "Waiting for the other superintendent to finish their turn.", tone: "wait" };
  }

  switch (phase) {
    case "contractSelection":
      return {
        text: "Pick a ship contract below — Side A is standard (good to learn). This sets your starting dice.",
        tone: "do",
      };
    case "event":
      return {
        text: "Read the event card, then acknowledge it to continue the round.",
        tone: "do",
      };
    case "planning": {
      const hasHand = player.hand.length > 0;
      return {
        text: hasHand
          ? "Draft a Work Order from the Market, then tap a card in your hand and place it into an empty drydock slot (costs Material)."
          : "Draft a Work Order from the Market — the higher the PP, the bigger the reward.",
        tone: "do",
      };
    }
    case "action": {
      if (player.hasPassed) {
        return { text: "You've passed. Waiting for the round to resolve.", tone: "wait" };
      }
      if (player.actionsRemaining <= 0) {
        return { text: "No actions left — hit Pass Turn to end your turn.", tone: "warn" };
      }
      return {
        text: `You have ${player.actionsRemaining} action${
          player.actionsRemaining === 1 ? "" : "s"
        }. Tap one of your dice, then a matching slot on a staged job (it becomes a countdown timer). Or procure resources, or Pass Turn.`,
        tone: "do",
      };
    }
    case "resolution":
      return {
        text: "Dice count down by 1. Jobs reaching 0 get inspected — watch your Shipyard Integrity.",
        tone: "wait",
      };
    default:
      return { text: "", tone: "do" };
  }
}
