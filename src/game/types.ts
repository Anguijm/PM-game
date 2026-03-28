// ============================================================
// Drydock Masters — Core Type Definitions
// ============================================================

// --- Enums ---

export enum DieColor {
  Red = "red",       // Hull
  Blue = "blue",     // Engineering
  Yellow = "yellow", // Electrical
  Green = "green",   // Combat Systems
  Gray = "gray",     // Support (Wild)
}

export enum GamePhase {
  ContractSelection = "contractSelection",
  Event = "event",
  Planning = "planning",
  Action = "action",
  Resolution = "resolution",
}

export enum CardType {
  WorkOrder = "workOrder",
  BAWP = "bawp",
  GrowthWork = "growthWork",
  Event = "event",
  Foreman = "foreman",
  ShipContract = "shipContract",
  AdmiralMandate = "admiralMandate",
}

export enum ContractSide {
  A = "A", // Standard
  B = "B", // Complex
}

export enum CFRResult {
  Clear = "clear",
  Growth = "growth",
}

export enum EventPersistence {
  Instant = "instant",
  Persistent = "persistent",
}

// --- Dice ---

export interface LaborDie {
  id: string;
  color: DieColor;
  /** Current countdown value. null = unassigned */
  value: number | null;
  /** Original time value when assigned (for loan PP distribution). null = unassigned */
  originalValue: number | null;
  /** Player who owns this die */
  ownerID: string;
  /** Player currently holding this die (may differ if loaned) */
  holderID: string;
  /** ID of the staged work slot this die is assigned to, or null */
  assignedToSlot: string | null;
}

// --- Labor Requirements on Cards ---

export interface LaborRequirement {
  color: DieColor;
  time: number; // starting countdown value
}

// --- Cards ---

export interface WorkOrderCard {
  id: string;
  type: CardType.WorkOrder;
  name: string;
  phase: "A" | "B";
  materialCost: number;
  laborRequirements: LaborRequirement[];
  prestigeValue: number;
  isHighProfile: boolean;
  /** Category for milestone tracking */
  category: "combat" | "propulsion" | "engineering" | "general";
}

export interface BAWPCard {
  id: string;
  type: CardType.BAWP;
  name: string;
  materialCost: number;
  laborRequirements: LaborRequirement[];
  prestigeValue: number;
  isHighProfile: boolean;
  category: "combat" | "propulsion" | "engineering" | "general";
}

export interface GrowthWorkCard {
  id: string;
  type: CardType.GrowthWork;
  name: string;
  materialCost: number;
  laborRequirements: LaborRequirement[];
  prestigeValue: number;
  isHighProfile: boolean;
}

export interface EventCard {
  id: string;
  type: CardType.Event;
  name: string;
  deck: "I" | "II";
  persistence: EventPersistence;
  description: string;
  effect: EventEffect;
  /** Cost to clear if persistent */
  clearCost?: ClearCost;
}

export interface EventEffect {
  /** SI change (negative = loss) */
  siChange?: number;
  /** Funding change for all players */
  fundingChange?: number;
  /** Material change for all players */
  materialChange?: number;
  /** Custom effect ID for special logic */
  special?: string;
}

export interface ClearCost {
  funding?: number;
  material?: number;
  actions?: number;
}

export interface ForemanCard {
  id: string;
  type: CardType.Foreman;
  name: string;
  description: string;
  /** Passive ability identifier */
  ability: string;
}

export interface ShipContractCard {
  id: string;
  type: CardType.ShipContract;
  name: string;
  side: ContractSide;
  /** Dice colors this contract provides */
  startingDice: DieColor[];
  /** Required completions by milestone deadlines */
  milestones: {
    round6: MilestoneRequirement;  // Combat Systems
    round8: MilestoneRequirement;  // Propulsion & Engineering
    round10: MilestoneRequirement; // Final
  };
}

export interface MilestoneRequirement {
  /** Number of work orders in each category that must be completed */
  quotas: Record<string, number>;
}

export interface AdmiralMandateCard {
  id: string;
  type: CardType.AdmiralMandate;
  name: string;
  description: string;
  /** Global rule modifier ID */
  rule: string;
}

/** Union of all stageable work cards */
export type WorkCard = WorkOrderCard | BAWPCard | GrowthWorkCard;

/** Union of all card types */
export type AnyCard =
  | WorkOrderCard
  | BAWPCard
  | GrowthWorkCard
  | EventCard
  | ForemanCard
  | ShipContractCard
  | AdmiralMandateCard;

// --- Staged Work Slot ---

export interface StagedWorkSlot {
  id: string;
  /** The card in this slot, or null if empty */
  card: WorkCard | null;
  /** Dice assigned to this slot's labor requirements */
  assignedDice: string[]; // die IDs
}

// --- Trade / Loan ---

export interface TradeOffer {
  id: string;
  fromPlayerID: string;
  toPlayerID: string;
  /** What the sender offers */
  offer: {
    funding?: number;
    material?: number;
    dieID?: string; // for Coordinate action
  };
  /** What the sender wants in return */
  request: {
    funding?: number;
    material?: number;
    prestigePoints?: number; // for loaned labor PP split
  };
  status: "pending" | "accepted" | "rejected" | "countered";
}

export interface LoanAgreement {
  dieID: string;
  lenderID: string;
  borrowerID: string;
  /** Agreed PP to give lender on completion, or null for default split */
  agreedPP: number | null;
  /** Slot the loaned die is working on */
  slotID: string;
}

// --- Player State ---

export interface PlayerState {
  id: string;
  name: string;
  /** Prestige Points */
  pp: number;
  funding: number;
  material: number;
  /** Actions remaining this round */
  actionsRemaining: number;
  /** The chosen Ship Contract */
  contract: ShipContractCard | null;
  /** Two contracts to choose from during setup (cleared after selection) */
  contractChoices: ShipContractCard[];
  /** Hand of available work orders (AWP) */
  hand: WorkCard[];
  /** 4 staged work slots on the drydock board */
  stagedSlots: [StagedWorkSlot, StagedWorkSlot, StagedWorkSlot, StagedWorkSlot];
  /** All dice owned by this player */
  dice: LaborDie[];
  /** Foreman card (if hired) */
  foreman: ForemanCard | null;
  /** Completed work orders */
  completedWork: WorkCard[];
  /** Active loan agreements where this player is borrower */
  activeLoans: LoanAgreement[];
  /** Whether this player has explicitly passed their turn in the action phase */
  hasPassed: boolean;
  /** Whether foreman freeCountdown ability has been used this round */
  foremanUsedThisRound: boolean;
}

// --- CFR Bag ---

export interface CFRBag {
  tokens: CFRResult[];
}

// --- Game State ---

export interface DrydockMastersState {
  // --- Round tracking ---
  round: number;
  phase: GamePhase;

  // --- Shared metrics ---
  shipyardIntegrity: number;

  // --- Players ---
  players: Record<string, PlayerState>;

  // --- Decks ---
  workOrderDeckA: WorkOrderCard[];
  workOrderDeckB: WorkOrderCard[];
  /** Combined work order deck (B shuffled in at round 6) */
  workOrderDeck: WorkOrderCard[];
  eventDeckI: EventCard[];
  eventDeckII: EventCard[];
  bawpDeck: BAWPCard[];
  growthWorkDeck: GrowthWorkCard[];
  foremanDeck: ForemanCard[];

  // --- Markets ---
  workOrderMarket: WorkOrderCard[];
  foremanMarket: ForemanCard[];

  // --- Active events ---
  activeEvent: EventCard | null;
  persistentProblems: EventCard[];

  // --- CFR Bag ---
  cfrBag: CFRBag;

  // --- Admiral's Mandate ---
  admiralMandate: AdmiralMandateCard | null;

  // --- Ship Contracts (for dealing during setup) ---
  contractDeck: ShipContractCard[];
  admiralMandateDeck: AdmiralMandateCard[];

  // --- Trade ---
  pendingTrades: TradeOffer[];

  // --- Team action tracking ---
  teamActionsUsedThisRound: {
    emergencyOvertime: boolean;
    expeditedShipping: boolean;
  };

  // --- Phase pacing (UI acknowledgment) ---
  eventAcknowledged: boolean;
  resolutionAcknowledged: boolean;

  // --- Game end ---
  gameOver: boolean;
  collectiveGoalMet: boolean;

  // --- First player ---
  firstPlayerIndex: number;
}

// --- SI Threshold Constants ---

export const SI_THRESHOLDS = {
  INCREASED_OVERSIGHT: 20,    // No utilization bonus
  SUPPLY_CHAIN_SKEPTICISM: 10, // Reduced procurement
  EMERGENCY_MEASURES: 5,       // No cross-training
} as const;

export const GAME_CONSTANTS = {
  MAX_ROUNDS: 12,
  ON_TIME_ROUND: 10,
  LATE_PENALTY_SI: 5,
  STARTING_SI: 22,
  MAX_SI: 35,
  STARTING_FUNDING: 5,
  STARTING_MATERIAL: 3,
  ACTIONS_PER_TURN: 2,
  STAGED_SLOTS: 4,
  BAWP_DEAL_COUNT: 3,
  AWP_DRAW_COUNT: 3,
  CROSS_TRAINING_FEE: 2,
  LABOR_WAGE: 1,
  FOREMAN_COST: 10,
  FOREMAN_PP: 3,
  ANALYZE_MARKET_COST: 1,
  EMERGENCY_OVERTIME_SI: 3,
  EXPEDITED_SHIPPING_SI: 2,
  EXPEDITED_SHIPPING_MATERIAL: 2,
  MILESTONE_REWARD_PP: 2,
  MILESTONE_PENALTY_SI_FLAT: 2,  // flat SI cost per failing player
  MILESTONE_PENALTY_PP: 2,       // PP cost per missing job (was -3)
  HIGH_PROFILE_SI_BONUS: 1,
  HIGH_PROFILE_PP_BONUS: 1,
  CFR_CLEAR_COUNT: 17,           // was 16 — 85/15 ratio
  CFR_GROWTH_COUNT: 3,           // was 4 — less punishing
  GROWTH_WORK_SI_PENALTY: -1,    // team loses SI on growth work draw
  GROWTH_WORK_PP_COMPENSATION: 2, // affected player gets PP (net +1 after -1 penalty)
  GROWTH_WORK_FUNDING_COMPENSATION: 2, // affected player gets funding
  CLEAR_OBSTRUCTION_SI_BONUS: 2, // SI recovered for clearing a problem
  CLEAR_OBSTRUCTION_PP_BONUS: 3, // PP reward for clearing
  TEAM_ACTION_PP_BONUS: 1,       // PP reward for using team actions
  PROCUREMENT_FUNDING: 3,
  PROCUREMENT_MATERIAL: 2,
  RESOURCE_CAP: 15,
  PERSISTENT_PROBLEM_SI_DRAIN: 1, // SI lost per active problem per round
  UTILIZATION_BONUS: 2,
  FINAL_FUNDING_PP_RATIO: 5,
  FINAL_MATERIAL_PP_RATIO: 3,
  // Cumulative milestone quotas (total jobs, any category)
  MILESTONE_R6_QUOTA: 2,
  MILESTONE_R8_QUOTA: 4,
  MILESTONE_R10_QUOTA: 6,
} as const;
