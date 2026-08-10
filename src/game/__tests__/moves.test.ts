import { describe, it, expect, beforeEach } from "vitest";
import { setupGame } from "../setup";
import {
  stageWork,
  assignLabor,
  procurement,
  coordinate,
  analyzeMarket,
  hireForeman,
  clearObstruction,
  trade,
  emergencyOvertime,
  expeditedShipping,
  draftCard,
  pass,
} from "../moves";
import { INVALID_MOVE } from "boardgame.io/core";
import type { DrydockMastersState } from "../types";
import { DieColor, GAME_CONSTANTS, SI_THRESHOLDS, EventPersistence, CardType } from "../types";

function makeCtx(G: DrydockMastersState, playerID: string) {
  return { G, playerID };
}

describe("stageWork", () => {
  let G: DrydockMastersState;

  beforeEach(() => {
    G = setupGame({ numPlayers: 2 });
  });

  it("stages a card from hand to an empty slot", () => {
    const player = G.players["0"];
    // Slot 3 should be empty (BAWP fills 0-2)
    const card = player.hand[0];
    // setupGame isn't seeded, so hand[0]'s cost varies; guarantee affordability
    // (STARTING_MATERIAL is only 2) so this never no-ops on cost.
    player.material = 20;
    const materialBefore = player.material;

    stageWork(makeCtx(G, "0"), card.id, 3);

    expect(player.stagedSlots[3].card).toBe(card);
    expect(player.hand).not.toContain(card);
    expect(player.material).toBe(materialBefore - card.materialCost);
    expect(player.actionsRemaining).toBe(GAME_CONSTANTS.ACTIONS_PER_TURN - 1);
  });

  it("rejects staging to an occupied slot", () => {
    const card = G.players["0"].hand[0];
    const result = stageWork(makeCtx(G, "0"), card.id, 0); // slot 0 has BAWP
    expect(result).toBe(INVALID_MOVE);
  });

  it("rejects staging with insufficient material", () => {
    const player = G.players["0"];
    player.material = 0;
    // Find a card with material cost > 0
    const card = player.hand.find((c) => c.materialCost > 0);
    if (card) {
      const result = stageWork(makeCtx(G, "0"), card.id, 3);
      expect(result).toBe(INVALID_MOVE);
    }
  });

  it("rejects staging with no actions remaining", () => {
    const player = G.players["0"];
    player.actionsRemaining = 0;
    const card = player.hand[0];
    const result = stageWork(makeCtx(G, "0"), card.id, 3);
    expect(result).toBe(INVALID_MOVE);
  });

  it("rejects staging a card not in hand", () => {
    const result = stageWork(makeCtx(G, "0"), "nonexistent-card", 3);
    expect(result).toBe(INVALID_MOVE);
  });
});

describe("assignLabor", () => {
  let G: DrydockMastersState;

  beforeEach(() => {
    G = setupGame({ numPlayers: 2 });
  });

  it("assigns a matching die to a staged card requirement", () => {
    const player = G.players["0"];
    const slot = player.stagedSlots[0]; // BAWP card
    const card = slot.card!;
    const req = card.laborRequirements[0];
    const die = player.dice.find((d) => d.color === req.color && d.assignedToSlot === null);

    if (die) {
      const fundingBefore = player.funding;
      assignLabor(makeCtx(G, "0"), die.id, 0, 0);

      expect(die.value).toBe(req.time);
      expect(die.originalValue).toBe(req.time);
      expect(die.assignedToSlot).toBe(slot.id);
      expect(slot.assignedDice[0]).toBe(die.id);
      expect(player.funding).toBe(fundingBefore - GAME_CONSTANTS.LABOR_WAGE);
    }
  });

  it("charges cross-training fee for non-matching die", () => {
    const player = G.players["0"];
    const slot = player.stagedSlots[0];
    const card = slot.card!;
    const req = card.laborRequirements[0];
    // Find a die of a different color (not gray)
    const die = player.dice.find(
      (d) => d.color !== req.color && d.color !== DieColor.Gray && d.assignedToSlot === null
    );

    if (die) {
      const fundingBefore = player.funding;
      assignLabor(makeCtx(G, "0"), die.id, 0, 0);
      expect(player.funding).toBe(
        fundingBefore - GAME_CONSTANTS.LABOR_WAGE - GAME_CONSTANTS.CROSS_TRAINING_FEE
      );
    }
  });

  it("gray die is wild — no cross-training fee", () => {
    const player = G.players["0"];
    const slot = player.stagedSlots[0];
    const grayDie = player.dice.find((d) => d.color === DieColor.Gray && d.assignedToSlot === null);

    if (grayDie) {
      const fundingBefore = player.funding;
      assignLabor(makeCtx(G, "0"), grayDie.id, 0, 0);
      expect(player.funding).toBe(fundingBefore - GAME_CONSTANTS.LABOR_WAGE);
    }
  });

  it("blocks cross-training when SI < 5", () => {
    G.shipyardIntegrity = 4;
    const player = G.players["0"];
    const slot = player.stagedSlots[0];
    const req = slot.card!.laborRequirements[0];
    const die = player.dice.find(
      (d) => d.color !== req.color && d.color !== DieColor.Gray && d.assignedToSlot === null
    );
    if (die) {
      const result = assignLabor(makeCtx(G, "0"), die.id, 0, 0);
      expect(result).toBe(INVALID_MOVE);
    }
  });
});

describe("procurement", () => {
  let G: DrydockMastersState;

  beforeEach(() => {
    G = setupGame({ numPlayers: 2 });
    // Clear mandate to prevent interference
    G.admiralMandate = null;
    // Clear persistent problems
    G.persistentProblems = [];
  });

  it("grants procurement funding", () => {
    const player = G.players["0"];
    const before = player.funding;
    procurement(makeCtx(G, "0"), "funding");
    expect(player.funding).toBe(before + GAME_CONSTANTS.PROCUREMENT_FUNDING);
  });

  it("grants 2 material", () => {
    const player = G.players["0"];
    const before = player.material;
    procurement(makeCtx(G, "0"), "material");
    expect(player.material).toBe(before + GAME_CONSTANTS.PROCUREMENT_MATERIAL);
  });

  it("reduces material by 1 when SI < 10", () => {
    G.shipyardIntegrity = 9;
    const player = G.players["0"];
    const before = player.material;
    procurement(makeCtx(G, "0"), "material");
    expect(player.material).toBe(before + GAME_CONSTANTS.PROCUREMENT_MATERIAL - 1);
  });
});

describe("coordinate", () => {
  let G: DrydockMastersState;

  beforeEach(() => {
    G = setupGame({ numPlayers: 2 });
  });

  it("loans a die to another player", () => {
    const die = G.players["0"].dice[0];
    coordinate(makeCtx(G, "0"), die.id, "1");
    expect(die.holderID).toBe("1");
    expect(die.ownerID).toBe("0");
  });

  it("rejects loaning to self", () => {
    const die = G.players["0"].dice[0];
    const result = coordinate(makeCtx(G, "0"), die.id, "0");
    expect(result).toBe(INVALID_MOVE);
  });

  it("rejects loaning an assigned die", () => {
    const die = G.players["0"].dice[0];
    die.assignedToSlot = "slot-0";
    const result = coordinate(makeCtx(G, "0"), die.id, "1");
    expect(result).toBe(INVALID_MOVE);
  });
});

describe("trade", () => {
  let G: DrydockMastersState;

  beforeEach(() => {
    G = setupGame({ numPlayers: 2 });
  });

  it("exchanges resources between players (free action)", () => {
    const p0 = G.players["0"];
    const p1 = G.players["1"];
    const actionsBefore = p0.actionsRemaining;

    trade(makeCtx(G, "0"), "1", 2, 0, 0, 1);

    expect(p0.funding).toBe(GAME_CONSTANTS.STARTING_FUNDING - 2);
    expect(p1.funding).toBe(GAME_CONSTANTS.STARTING_FUNDING + 2);
    expect(p0.material).toBe(GAME_CONSTANTS.STARTING_MATERIAL + 1);
    expect(p1.material).toBe(GAME_CONSTANTS.STARTING_MATERIAL - 1);
    expect(p0.actionsRemaining).toBe(actionsBefore); // free action
  });

  it("rejects negative amounts", () => {
    const result = trade(makeCtx(G, "0"), "1", -5, 0, 0, 0);
    expect(result).toBe(INVALID_MOVE);
  });

  it("rejects non-integer amounts", () => {
    const result = trade(makeCtx(G, "0"), "1", 1.5, 0, 0, 0);
    expect(result).toBe(INVALID_MOVE);
  });

  it("rejects zero-value trades", () => {
    const result = trade(makeCtx(G, "0"), "1", 0, 0, 0, 0);
    expect(result).toBe(INVALID_MOVE);
  });
});

describe("emergencyOvertime", () => {
  let G: DrydockMastersState;

  beforeEach(() => {
    G = setupGame({ numPlayers: 2 });
    // Set up an assigned die
    const die = G.players["0"].dice[0];
    die.value = 3;
    die.originalValue = 3;
    die.assignedToSlot = "slot-0";
  });

  it("decreases die value by 1 and spends 3 SI", () => {
    const siBefore = G.shipyardIntegrity;
    const die = G.players["0"].dice[0];
    emergencyOvertime(makeCtx(G, "0"), "0", die.id);

    expect(die.value).toBe(2);
    expect(G.shipyardIntegrity).toBe(siBefore - GAME_CONSTANTS.EMERGENCY_OVERTIME_SI);
    expect(G.teamActionsUsedThisRound.emergencyOvertime).toBe(true);
  });

  it("rejects if already used this round", () => {
    const die = G.players["0"].dice[0];
    emergencyOvertime(makeCtx(G, "0"), "0", die.id);
    const result = emergencyOvertime(makeCtx(G, "0"), "0", die.id);
    expect(result).toBe(INVALID_MOVE);
  });

  it("triggers game over if SI drops to 0", () => {
    G.shipyardIntegrity = 3;
    const die = G.players["0"].dice[0];
    emergencyOvertime(makeCtx(G, "0"), "0", die.id);
    expect(G.shipyardIntegrity).toBe(0);
    expect(G.gameOver).toBe(true);
  });

  it("rejects on die with value 0 (prevents negative)", () => {
    const die = G.players["0"].dice[0];
    die.value = 0;
    const result = emergencyOvertime(makeCtx(G, "0"), "0", die.id);
    expect(result).toBe(INVALID_MOVE);
  });
});

describe("pass", () => {
  it("sets hasPassed to true", () => {
    const G = setupGame({ numPlayers: 2 });
    expect(G.players["0"].hasPassed).toBe(false);
    pass(makeCtx(G, "0"));
    expect(G.players["0"].hasPassed).toBe(true);
  });
});

describe("draftCard", () => {
  let G: DrydockMastersState;

  beforeEach(() => {
    G = setupGame({ numPlayers: 2 });
  });

  it("picks a card from the market into hand", () => {
    const player = G.players["0"];
    const handBefore = player.hand.length;
    const marketBefore = G.workOrderMarket.length;
    const card = G.workOrderMarket[0];

    draftCard(makeCtx(G, "0"), 0);

    expect(player.hand).toHaveLength(handBefore + 1);
    expect(player.hand).toContain(card);
    expect(G.workOrderMarket).toHaveLength(marketBefore - 1);
  });

  it("rejects invalid market index", () => {
    const result = draftCard(makeCtx(G, "0"), 99);
    expect(result).toBe(INVALID_MOVE);
  });
});

describe("hireForeman", () => {
  let G: DrydockMastersState;

  beforeEach(() => {
    G = setupGame({ numPlayers: 2 });
  });

  it("costs $10, grants foreman and 3 PP", () => {
    const player = G.players["0"];
    player.funding = 15;
    const foreman = G.foremanMarket[0];

    hireForeman(makeCtx(G, "0"), 0);

    expect(player.foreman).toBe(foreman);
    expect(player.funding).toBe(15 - GAME_CONSTANTS.FOREMAN_COST);
    expect(player.pp).toBe(GAME_CONSTANTS.FOREMAN_PP);
  });

  it("rejects if already has a foreman", () => {
    const player = G.players["0"];
    player.funding = 20;
    hireForeman(makeCtx(G, "0"), 0);
    const result = hireForeman(makeCtx(G, "0"), 0);
    expect(result).toBe(INVALID_MOVE);
  });

  it("rejects with insufficient funding", () => {
    G.players["0"].funding = 5;
    const result = hireForeman(makeCtx(G, "0"), 0);
    expect(result).toBe(INVALID_MOVE);
  });
});

describe("clearObstruction", () => {
  let G: DrydockMastersState;

  beforeEach(() => {
    G = setupGame({ numPlayers: 2 });
    G.persistentProblems.push({
      id: "test-problem",
      type: CardType.Event,
      name: "Test Problem",
      deck: "II",
      persistence: EventPersistence.Persistent,
      description: "A test problem.",
      effect: { special: "test" },
      clearCost: { funding: 3, material: 1 },
    });
  });

  it("removes a persistent problem by paying costs", () => {
    const player = G.players["0"];
    clearObstruction(makeCtx(G, "0"), 0);
    expect(G.persistentProblems).toHaveLength(0);
    expect(player.funding).toBe(GAME_CONSTANTS.STARTING_FUNDING - 3);
    expect(player.material).toBe(GAME_CONSTANTS.STARTING_MATERIAL - 1);
  });

  it("rejects with insufficient resources", () => {
    G.players["0"].funding = 1;
    const result = clearObstruction(makeCtx(G, "0"), 0);
    expect(result).toBe(INVALID_MOVE);
  });
});
