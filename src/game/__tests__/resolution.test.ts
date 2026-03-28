import { describe, it, expect, beforeEach } from "vitest";
import { setupGame } from "../setup";
import {
  applyUtilizationBonus,
  countdownDice,
  resolveCompletions,
  checkMilestones,
  marketChurn,
  cleanup,
  calculateFinalScores,
} from "../resolution";
import type { DrydockMastersState, WorkOrderCard } from "../types";
import {
  DieColor,
  CardType,
  ContractSide,
  GAME_CONSTANTS,
  SI_THRESHOLDS,
  CFRResult,
} from "../types";

describe("applyUtilizationBonus", () => {
  let G: DrydockMastersState;

  beforeEach(() => {
    G = setupGame({ numPlayers: 2 });
  });

  it("grants $2 when all staged cards have dice", () => {
    const player = G.players["0"];
    // Assign at least one die to each BAWP card in slots 0-2
    for (let i = 0; i < 3; i++) {
      const slot = player.stagedSlots[i];
      if (slot.card) {
        slot.assignedDice[0] = player.dice[i].id;
        player.dice[i].assignedToSlot = slot.id;
      }
    }
    const fundingBefore = player.funding;
    applyUtilizationBonus(G);
    expect(player.funding).toBe(fundingBefore + GAME_CONSTANTS.UTILIZATION_BONUS);
  });

  it("does NOT grant bonus when player has zero staged cards", () => {
    const player = G.players["0"];
    // Clear all staged slots
    for (const slot of player.stagedSlots) {
      slot.card = null;
      slot.assignedDice = [];
    }
    const fundingBefore = player.funding;
    applyUtilizationBonus(G);
    expect(player.funding).toBe(fundingBefore); // No bonus
  });

  it("does NOT grant bonus when a card has no dice", () => {
    // Slot 0 has a BAWP but no dice assigned
    const player = G.players["0"];
    const fundingBefore = player.funding;
    applyUtilizationBonus(G);
    expect(player.funding).toBe(fundingBefore); // No bonus
  });

  it("is blocked when SI < 20", () => {
    G.shipyardIntegrity = 19;
    const player = G.players["0"];
    for (let i = 0; i < 3; i++) {
      const slot = player.stagedSlots[i];
      if (slot.card) {
        slot.assignedDice[0] = player.dice[i].id;
      }
    }
    const fundingBefore = player.funding;
    applyUtilizationBonus(G);
    expect(player.funding).toBe(fundingBefore); // Blocked
  });
});

describe("countdownDice", () => {
  it("reduces all assigned dice by 1", () => {
    const G = setupGame({ numPlayers: 2 });
    const die = G.players["0"].dice[0];
    die.value = 3;
    die.assignedToSlot = "slot-0";

    countdownDice(G);

    expect(die.value).toBe(2);
  });

  it("does not reduce unassigned dice", () => {
    const G = setupGame({ numPlayers: 2 });
    const die = G.players["0"].dice[0];
    die.value = null;
    die.assignedToSlot = null;

    countdownDice(G);

    expect(die.value).toBeNull();
  });

  it("does not go below 0", () => {
    const G = setupGame({ numPlayers: 2 });
    const die = G.players["0"].dice[0];
    die.value = 0;
    die.assignedToSlot = "slot-0";

    countdownDice(G);

    expect(die.value).toBe(0);
  });
});

describe("resolveCompletions", () => {
  let G: DrydockMastersState;

  beforeEach(() => {
    G = setupGame({ numPlayers: 2 });
    G.admiralMandate = null; // prevent mandate interference
  });

  it("completes a job when all dice reach 0 and all reqs filled", () => {
    const player = G.players["0"];
    const slot = player.stagedSlots[0];
    const card = slot.card!;
    const die = player.dice[0];

    // Set up: die assigned and at value 0
    die.value = 0;
    die.originalValue = 2;
    die.assignedToSlot = slot.id;
    slot.assignedDice = [die.id];

    // Ensure only 1 requirement on the card for simplicity
    card.laborRequirements = [card.laborRequirements[0]];

    // Force CFR to clear
    G.cfrBag.tokens = [CFRResult.Clear];

    const ppBefore = player.pp;
    resolveCompletions(G);

    expect(player.completedWork).toContain(card);
    expect(player.pp).toBe(ppBefore + card.prestigeValue);
    expect(slot.card).toBeNull();
    expect(die.value).toBeNull();
    expect(die.assignedToSlot).toBeNull();
    expect(die.originalValue).toBeNull();
  });

  it("handles Growth Work CFR result — loses 1 PP and draws growth card", () => {
    const player = G.players["0"];
    const slot = player.stagedSlots[0];
    const card = slot.card!;
    const die = player.dice[0];

    die.value = 0;
    die.originalValue = 1;
    die.assignedToSlot = slot.id;
    slot.assignedDice = [die.id];
    card.laborRequirements = [card.laborRequirements[0]];

    // Force CFR to growth
    G.cfrBag.tokens = [CFRResult.Growth];

    player.pp = 5;
    const growthDeckBefore = G.growthWorkDeck.length;

    resolveCompletions(G);

    // -1 PP penalty + 2 PP compensation = net +1
    expect(player.pp).toBe(6);
    // Team loses SI
    expect(G.shipyardIntegrity).toBeLessThan(GAME_CONSTANTS.STARTING_SI);
    // Player gets funding compensation
    expect(player.funding).toBeGreaterThan(GAME_CONSTANTS.STARTING_FUNDING);
    expect(G.growthWorkDeck.length).toBeLessThanOrEqual(growthDeckBefore);
  });

  it("replenishes CFR bag when empty", () => {
    const player = G.players["0"];
    const slot = player.stagedSlots[0];
    const card = slot.card!;
    const die = player.dice[0];

    die.value = 0;
    die.originalValue = 1;
    die.assignedToSlot = slot.id;
    slot.assignedDice = [die.id];
    card.laborRequirements = [card.laborRequirements[0]];

    // Empty the bag
    G.cfrBag.tokens = [];

    // Should not crash — bag is replenished
    const results = resolveCompletions(G);
    expect(results).toHaveLength(1);
    expect(results[0].cfrResult).toBeDefined();
  });
});

describe("checkMilestones", () => {
  let G: DrydockMastersState;

  beforeEach(() => {
    G = setupGame({ numPlayers: 2 });
    G.admiralMandate = null;
  });

  it("rewards 2 PP for meeting round 6 cumulative milestone", () => {
    const player = G.players["0"];
    player.contract = {
      id: "test", type: CardType.ShipContract, name: "Test Ship",
      side: ContractSide.A,
      startingDice: [DieColor.Red, DieColor.Blue, DieColor.Yellow, DieColor.Green, DieColor.Gray],
      milestones: {
        round6: { quotas: { combat: 1 } },
        round8: { quotas: { engineering: 1 } },
        round10: { quotas: { combat: 1, engineering: 1 } },
      },
    };
    // Complete enough jobs to meet cumulative quota (2 by R6)
    for (let i = 0; i < GAME_CONSTANTS.MILESTONE_R6_QUOTA; i++) {
      player.completedWork.push({
        id: `wo-test-${i}`, type: CardType.WorkOrder, name: "Test",
        phase: "A", materialCost: 0, laborRequirements: [],
        prestigeValue: 0, isHighProfile: false, category: "combat",
      });
    }

    G.round = 6;
    player.pp = 0;
    checkMilestones(G);
    expect(player.pp).toBe(GAME_CONSTANTS.MILESTONE_REWARD_PP);
  });

  it("penalizes SI (flat) and PP for missing milestones", () => {
    const player = G.players["0"];
    player.contract = {
      id: "test", type: CardType.ShipContract, name: "Test Ship",
      side: ContractSide.A,
      startingDice: [DieColor.Red, DieColor.Blue, DieColor.Yellow, DieColor.Green, DieColor.Gray],
      milestones: {
        round6: { quotas: { combat: 2 } },
        round8: { quotas: {} },
        round10: { quotas: {} },
      },
    };
    // 0 completed, need MILESTONE_R6_QUOTA (2)

    G.round = 6;
    player.pp = 10;
    const siBefore = G.shipyardIntegrity;

    checkMilestones(G);

    // Flat SI penalty per failing player, PP per missing job
    const missing = GAME_CONSTANTS.MILESTONE_R6_QUOTA;
    expect(G.shipyardIntegrity).toBe(siBefore - GAME_CONSTANTS.MILESTONE_PENALTY_SI_FLAT);
    expect(player.pp).toBe(10 - GAME_CONSTANTS.MILESTONE_PENALTY_PP * missing);
  });

  it("triggers game over if SI drops to 0 from milestone penalties", () => {
    const player = G.players["0"];
    player.contract = {
      id: "test", type: CardType.ShipContract, name: "Test Ship",
      side: ContractSide.A,
      startingDice: [DieColor.Red, DieColor.Blue, DieColor.Yellow, DieColor.Green, DieColor.Gray],
      milestones: {
        round6: { quotas: { combat: 5 } },
        round8: { quotas: {} },
        round10: { quotas: {} },
      },
    };

    G.round = 6;
    G.shipyardIntegrity = 2; // flat -3 penalty will drop to -1 -> 0
    checkMilestones(G);

    expect(G.shipyardIntegrity).toBe(0);
    expect(G.gameOver).toBe(true);
  });
});

describe("marketChurn", () => {
  it("removes the leftmost card", () => {
    const G = setupGame({ numPlayers: 2 });
    const firstCard = G.workOrderMarket[0];
    const sizeBefore = G.workOrderMarket.length;
    marketChurn(G);
    expect(G.workOrderMarket).not.toContain(firstCard);
    expect(G.workOrderMarket).toHaveLength(sizeBefore - 1);
  });
});

describe("cleanup", () => {
  it("advances round and rotates first player", () => {
    const G = setupGame({ numPlayers: 2 });
    G.round = 1;
    cleanup(G);
    expect(G.round).toBe(2);
    expect(G.firstPlayerIndex).toBe(1);
  });

  it("resets hasPassed and actions for all players", () => {
    const G = setupGame({ numPlayers: 2 });
    G.players["0"].hasPassed = true;
    G.players["0"].actionsRemaining = 0;
    cleanup(G);
    expect(G.players["0"].hasPassed).toBe(false);
    expect(G.players["0"].actionsRemaining).toBe(GAME_CONSTANTS.ACTIONS_PER_TURN);
  });

  it("applies late penalty at rounds 11+", () => {
    const G = setupGame({ numPlayers: 2 });
    G.round = 11;
    const siBefore = G.shipyardIntegrity;
    cleanup(G);
    expect(G.shipyardIntegrity).toBe(siBefore - GAME_CONSTANTS.LATE_PENALTY_SI);
  });

  it("ends game at round 12", () => {
    const G = setupGame({ numPlayers: 2 });
    G.round = 12;
    cleanup(G);
    expect(G.gameOver).toBe(true);
  });
});

describe("calculateFinalScores", () => {
  it("adds PP + funding/5 + material/3", () => {
    const G = setupGame({ numPlayers: 2 });
    const player = G.players["0"];
    player.pp = 10;
    player.funding = 12; // +2 PP
    player.material = 7; // +2 PP

    const scores = calculateFinalScores(G);
    expect(scores["0"]).toBe(10 + 2 + 2);
  });
});
