import { INVALID_MOVE } from "boardgame.io/core";
import type {
  DrydockMastersState,
  PlayerState,
  LaborDie,
  StagedWorkSlot,
  CFRBag,
} from "./types";
import {
  CFRResult,
  DieColor,
  GamePhase,
  GAME_CONSTANTS,
} from "./types";
import {
  workOrdersPhaseA,
  workOrdersPhaseB,
  eventCardsI,
  eventCardsII,
  bawpCards,
  growthWorkCards,
  foremanCards,
  shipContracts,
  admiralMandates,
} from "../data/cards";
import { shuffle } from "./utils";

function createStagedSlots(): [StagedWorkSlot, StagedWorkSlot, StagedWorkSlot, StagedWorkSlot] {
  return [
    { id: "slot-0", card: null, assignedDice: [] },
    { id: "slot-1", card: null, assignedDice: [] },
    { id: "slot-2", card: null, assignedDice: [] },
    { id: "slot-3", card: null, assignedDice: [] },
  ];
}

function createDice(playerID: string, colors: DieColor[]): LaborDie[] {
  return colors.map((color, i) => ({
    id: `die-${playerID}-${color}-${i}`,
    color,
    value: null,
    originalValue: null,
    ownerID: playerID,
    holderID: playerID,
    assignedToSlot: null,
  }));
}

function createCFRBag(): CFRBag {
  const tokens: CFRResult[] = [
    ...Array(GAME_CONSTANTS.CFR_CLEAR_COUNT).fill(CFRResult.Clear),
    ...Array(GAME_CONSTANTS.CFR_GROWTH_COUNT).fill(CFRResult.Growth),
  ];
  return { tokens: shuffle(tokens) };
}

function createPlayer(playerID: string, diceColors: DieColor[]): PlayerState {
  return {
    id: playerID,
    name: `Player ${parseInt(playerID) + 1}`,
    pp: 0,
    funding: GAME_CONSTANTS.STARTING_FUNDING,
    material: GAME_CONSTANTS.STARTING_MATERIAL,
    actionsRemaining: GAME_CONSTANTS.ACTIONS_PER_TURN,
    contract: null,
    hand: [],
    stagedSlots: createStagedSlots(),
    dice: createDice(playerID, diceColors),
    foreman: null,
    completedWork: [],
    activeLoans: [],
    hasPassed: false,
    foremanUsedThisRound: false,
    contractChoices: [],
    problemsCleared: 0,
    growthWorksHit: 0,
    hasHadLowSI: false,
    tradesCount: 0,
    teamActionsCount: 0,
    hadFullHouse: false,
  };
}

export function setupGame(ctx: { numPlayers: number; random?: { Shuffle: <T>(arr: T[]) => T[] } }): DrydockMastersState {
  const numPlayers = ctx.numPlayers;
  const rngShuffle = ctx.random?.Shuffle || shuffle;

  // Shuffle all decks
  const shuffledWorkA = rngShuffle([...workOrdersPhaseA]);
  const shuffledWorkB = rngShuffle([...workOrdersPhaseB]);
  const shuffledEventI = rngShuffle([...eventCardsI]);
  const shuffledEventII = rngShuffle([...eventCardsII]);
  const shuffledBAWP = rngShuffle([...bawpCards]);
  const shuffledGrowthWork = rngShuffle([...growthWorkCards]);
  const shuffledForeman = rngShuffle([...foremanCards]);
  const shuffledContracts = rngShuffle([...shipContracts]);
  const shuffledMandates = rngShuffle([...admiralMandates]);

  // Reveal Admiral's Mandate
  const admiralMandate = shuffledMandates[0] || null;

  // Work Order Market: Player Count + 2 cards from Phase A
  const marketSize = numPlayers + 2;
  const workOrderMarket = shuffledWorkA.splice(0, marketSize);

  // Foreman Market: 4 cards
  const foremanMarket = shuffledForeman.splice(0, 4);

  // Default dice colors per player (5 dice each — will be overridden by contract)
  const defaultDice: DieColor[] = [
    DieColor.Red,
    DieColor.Blue,
    DieColor.Yellow,
    DieColor.Green,
    DieColor.Gray,
  ];

  // Create players
  const players: Record<string, PlayerState> = {};
  for (let i = 0; i < numPlayers; i++) {
    const playerID = String(i);
    players[playerID] = createPlayer(playerID, defaultDice);

    // Deal 3 BAWP cards — stage them in slots 0-2
    for (let s = 0; s < GAME_CONSTANTS.BAWP_DEAL_COUNT; s++) {
      const bawp = shuffledBAWP.pop();
      if (bawp) {
        players[playerID].stagedSlots[s].card = bawp;
      }
    }

    // Draw 3 AWP cards from Phase A deck
    for (let h = 0; h < GAME_CONSTANTS.AWP_DRAW_COUNT; h++) {
      const card = shuffledWorkA.pop();
      if (card) {
        players[playerID].hand.push(card);
      }
    }

    // Deal 2 contracts to choose from (1 Side-A and 1 Side-B when possible)
    const contractA = shuffledContracts.find((c) => c.side === "A");
    const contractB = shuffledContracts.find((c) => c.side === "B");
    if (contractA) {
      shuffledContracts.splice(shuffledContracts.indexOf(contractA), 1);
      players[playerID].contractChoices.push(contractA);
    }
    if (contractB) {
      shuffledContracts.splice(shuffledContracts.indexOf(contractB), 1);
      players[playerID].contractChoices.push(contractB);
    }
    // Fallback: if not enough of one side, deal whatever's left
    while (players[playerID].contractChoices.length < 2 && shuffledContracts.length > 0) {
      players[playerID].contractChoices.push(shuffledContracts.pop()!);
    }
  }

  return {
    round: 1,
    phase: GamePhase.ContractSelection,
    // Scale SI with player count: more players = more events = more drain
    // 2P: 22, 3P: 36, 4P: 40
    shipyardIntegrity: GAME_CONSTANTS.STARTING_SI + (numPlayers === 3 ? 14 : numPlayers >= 4 ? 18 : 0),
    players,

    workOrderDeckA: shuffledWorkA,
    workOrderDeckB: shuffledWorkB,
    workOrderDeck: shuffledWorkA, // starts as Phase A only
    eventDeckI: shuffledEventI,
    eventDeckII: shuffledEventII,
    bawpDeck: shuffledBAWP,
    growthWorkDeck: shuffledGrowthWork,
    foremanDeck: shuffledForeman,

    workOrderMarket,
    foremanMarket,

    activeEvent: null,
    persistentProblems: [],

    cfrBag: createCFRBag(),

    admiralMandate,
    contractDeck: shuffledContracts,
    admiralMandateDeck: shuffledMandates.slice(1),

    pendingTrades: [],

    teamActionsUsedThisRound: {
      emergencyOvertime: false,
      expeditedShipping: false,
    },

    eventAcknowledged: false,
    resolutionAcknowledged: false,
    playersDraftedThisRound: [],

    gameOver: false,
    collectiveGoalMet: false,
    firstPlayerIndex: 0,
  };
}
