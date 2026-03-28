/**
 * Drydock Masters — AI Bot Logic
 * 5 strategy archetypes usable as boardgame.io bot or local simulation.
 */

import type { DrydockMastersState, PlayerState, LaborDie } from "./types";
import { DieColor, GAME_CONSTANTS, SI_THRESHOLDS } from "./types";

export type BotStrategy = "balanced" | "aggressive" | "cautious" | "rush" | "hoarder";

export const BOT_STRATEGIES: { id: BotStrategy; name: string; description: string }[] = [
  { id: "balanced", name: "Balanced", description: "Stages affordable cards, assigns labor, procures when needed." },
  { id: "aggressive", name: "Aggressive", description: "Prioritizes high-PP cards and fast job completion." },
  { id: "cautious", name: "Cautious", description: "Stockpiles resources before committing. Prefers cheap jobs." },
  { id: "rush", name: "Rush", description: "Stages anything available as fast as possible." },
  { id: "hoarder", name: "Hoarder", description: "Accumulates resources before staging expensive jobs." },
];

function getAvailableDice(player: PlayerState): LaborDie[] {
  return player.dice.filter(
    (d) => d.holderID === player.id && d.assignedToSlot === null
  );
}

/**
 * Given a game state and player, returns the next move the bot should make.
 * Returns { move, args } or null if the bot should pass.
 */
export function getBotMove(
  G: DrydockMastersState,
  playerID: string,
  strategy: BotStrategy,
  phase: string
): { move: string; args: any[] } | null {
  const player = G.players[playerID];
  if (!player) return null;

  // Contract selection: pick Side-A (safer) unless aggressive → Side-B
  if (phase === "contractSelection") {
    if (player.contractChoices.length === 0) return { move: "pass", args: [] };
    const pick = strategy === "aggressive"
      ? player.contractChoices.find((c) => c.side === "B") || player.contractChoices[0]
      : player.contractChoices.find((c) => c.side === "A") || player.contractChoices[0];
    return { move: "selectContract", args: [pick.id] };
  }

  // Event phase: acknowledge
  if (phase === "event") {
    return { move: "acknowledgeEvent", args: [] };
  }

  // Planning phase: draft highest value card
  if (phase === "planning") {
    if (G.workOrderMarket.length === 0) return null;
    const scored = G.workOrderMarket
      .map((c, i) => ({
        index: i,
        value: c.prestigeValue - (c.materialCost > player.material ? 2 : 0),
      }))
      .sort((a, b) => b.value - a.value);
    return { move: "draftCard", args: [scored[0].index] };
  }

  // Resolution phase: acknowledge
  if (phase === "resolution") {
    return { move: "acknowledgeResolution", args: [] };
  }

  // Action phase
  if (phase === "action") {
    if (player.hasPassed) return { move: "pass", args: [] }; // already passed but still active — re-pass

    // Priority: clear obstructions if problems exist
    if (G.persistentProblems.length > 0) {
      for (let i = 0; i < G.persistentProblems.length; i++) {
        const prob = G.persistentProblems[i];
        if (!prob.clearCost) continue;
        const canAfford =
          (!prob.clearCost.funding || player.funding >= prob.clearCost.funding) &&
          (!prob.clearCost.material || player.material >= prob.clearCost.material);
        if (canAfford && player.actionsRemaining > 0) {
          return { move: "clearObstruction", args: [i] };
        }
      }
    }

    // Strategy-specific
    const emptySlot = player.stagedSlots.findIndex((s) => s.card === null);
    const avail = getAvailableDice(player);

    switch (strategy) {
      case "aggressive":
        if (emptySlot !== -1) {
          const card = getBestCard(player, "high");
          if (card) return { move: "stageWork", args: [card.id, emptySlot] };
        }
        { const assign = getAssignMove(G, player, avail);
          if (assign) return assign; }
        return getProcureMove(player);

      case "cautious":
        if (player.funding < 3 || player.material < 2) return getProcureMove(player);
        if (emptySlot !== -1) {
          const card = getBestCard(player, "cheap");
          if (card) return { move: "stageWork", args: [card.id, emptySlot] };
        }
        { const assign = getAssignMove(G, player, avail);
          if (assign) return assign; }
        return getProcureMove(player);

      case "rush":
        if (emptySlot !== -1) {
          const card = getBestCard(player, "any");
          if (card) return { move: "stageWork", args: [card.id, emptySlot] };
        }
        { const assign = getAssignMove(G, player, avail);
          if (assign) return assign; }
        return getProcureMove(player);

      case "hoarder": {
        // Emergency pivot: if close to milestone deadline and behind quota, rush
        const milestoneRounds = [6, 8, 10];
        const nextMilestone = milestoneRounds.find((r) => G.round <= r);
        if (nextMilestone && nextMilestone - G.round <= 1) {
          // Near deadline — behave like rush strategy
          if (emptySlot !== -1) {
            const card = getBestCard(player, "any");
            if (card) return { move: "stageWork", args: [card.id, emptySlot] };
          }
          { const assign = getAssignMove(G, player, avail);
            if (assign) return assign; }
          return getProcureMove(player);
        }
        if (player.funding < 7 || player.material < 4) return getProcureMove(player);
        if (emptySlot !== -1) {
          const card = getBestCard(player, "high");
          if (card) return { move: "stageWork", args: [card.id, emptySlot] };
        }
        { const assign = getAssignMove(G, player, avail);
          if (assign) return assign; }
        return getProcureMove(player);
      }

      default: // balanced
        if (emptySlot !== -1) {
          const card = getBestCard(player, "any");
          if (card) return { move: "stageWork", args: [card.id, emptySlot] };
        }
        { const assign = getAssignMove(G, player, avail);
          if (assign) return assign; }
        return getProcureMove(player);
    }
  }

  // Fallback: pass if no move found (prevents game freeze)
  return { move: "pass", args: [] };
}

function getBestCard(
  player: PlayerState,
  mode: "high" | "cheap" | "any"
) {
  const affordable = player.hand.filter((c) => c.materialCost <= player.material);
  if (affordable.length === 0) return null;
  if (mode === "high") affordable.sort((a, b) => b.prestigeValue - a.prestigeValue);
  else if (mode === "cheap") affordable.sort((a, b) => a.materialCost - b.materialCost);
  return affordable[0];
}

function getAssignMove(
  G: DrydockMastersState,
  player: PlayerState,
  avail: LaborDie[]
): { move: string; args: any[] } | null {
  if (avail.length === 0 || player.funding < 1 || player.actionsRemaining <= 0) return null;

  for (let si = 0; si < player.stagedSlots.length; si++) {
    const slot = player.stagedSlots[si];
    if (!slot.card) continue;
    for (let ri = 0; ri < slot.card.laborRequirements.length; ri++) {
      if (slot.assignedDice[ri]) continue;
      const req = slot.card.laborRequirements[ri];
      const die =
        avail.find((d) => d.color === req.color) ||
        avail.find((d) => d.color === DieColor.Gray) ||
        (G.shipyardIntegrity >= SI_THRESHOLDS.EMERGENCY_MEASURES ? avail[0] : null);
      if (!die) continue;
      const isCross = die.color !== req.color && die.color !== DieColor.Gray;
      const wage = 1 + (isCross ? GAME_CONSTANTS.CROSS_TRAINING_FEE : 0);
      if (player.funding >= wage) {
        return { move: "assignLabor", args: [die.id, si, ri] };
      }
    }
  }
  return null;
}

function getProcureMove(player: PlayerState): { move: string; args: any[] } | null {
  if (player.actionsRemaining <= 0) return { move: "pass", args: [] };
  return {
    move: "procurement",
    args: [player.material < 2 ? "material" : "funding"],
  };
}
