import { describe, it, expect } from "vitest";
import { setupGame } from "../setup";
import { GAME_CONSTANTS, GamePhase, DieColor } from "../types";

describe("setupGame", () => {
  const state = setupGame({ numPlayers: 3 });

  it("initializes at round 1, contract selection phase", () => {
    expect(state.round).toBe(1);
    expect(state.phase).toBe(GamePhase.ContractSelection);
  });

  it("sets starting SI based on player count", () => {
    // 3 players: STARTING_SI + 14 = 22 + 14 = 36
    expect(state.shipyardIntegrity).toBe(GAME_CONSTANTS.STARTING_SI + 14);
  });

  it("creates correct number of players", () => {
    expect(Object.keys(state.players)).toHaveLength(3);
  });

  it("gives each player 5 dice", () => {
    for (const player of Object.values(state.players)) {
      expect(player.dice).toHaveLength(5);
    }
  });

  it("gives each player starting funding and material", () => {
    for (const player of Object.values(state.players)) {
      expect(player.funding).toBe(GAME_CONSTANTS.STARTING_FUNDING);
      expect(player.material).toBe(GAME_CONSTANTS.STARTING_MATERIAL);
    }
  });

  it("stages 3 BAWP cards for each player", () => {
    for (const player of Object.values(state.players)) {
      const stagedCount = player.stagedSlots.filter((s) => s.card !== null).length;
      expect(stagedCount).toBe(GAME_CONSTANTS.BAWP_DEAL_COUNT);
    }
  });

  it("gives each player 3 cards in hand (AWP)", () => {
    for (const player of Object.values(state.players)) {
      expect(player.hand).toHaveLength(GAME_CONSTANTS.AWP_DRAW_COUNT);
    }
  });

  it("creates work order market of player count + 2", () => {
    expect(state.workOrderMarket).toHaveLength(3 + 2);
  });

  it("creates foreman market of 4", () => {
    expect(state.foremanMarket).toHaveLength(4);
  });

  it("sets up CFR bag with 20 tokens", () => {
    expect(state.cfrBag.tokens).toHaveLength(
      GAME_CONSTANTS.CFR_CLEAR_COUNT + GAME_CONSTANTS.CFR_GROWTH_COUNT
    );
  });

  it("reveals one Admiral's Mandate", () => {
    expect(state.admiralMandate).not.toBeNull();
  });

  it("starts with no persistent problems", () => {
    expect(state.persistentProblems).toHaveLength(0);
  });

  it("has gameOver as false", () => {
    expect(state.gameOver).toBe(false);
  });
});
