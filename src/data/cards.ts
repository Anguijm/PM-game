import type {
  WorkOrderCard,
  BAWPCard,
  GrowthWorkCard,
  EventCard,
  ForemanCard,
  ShipContractCard,
  AdmiralMandateCard,
} from "../game/types";
import {
  CardType,
  DieColor,
  ContractSide,
  EventPersistence,
} from "../game/types";

// ============================================================
// Starter Card Data — MVP set (expandable)
// ============================================================

// --- Work Orders: Phase A (Early game, simpler jobs) ---

export const workOrdersPhaseA: WorkOrderCard[] = [
  {
    id: "wo-a-001", type: CardType.WorkOrder, name: "Hull Inspection", phase: "A",
    materialCost: 1, laborRequirements: [{ color: DieColor.Red, time: 2 }],
    prestigeValue: 2, isHighProfile: false, category: "general",
  },
  {
    id: "wo-a-002", type: CardType.WorkOrder, name: "Bilge System Overhaul", phase: "A",
    materialCost: 2, laborRequirements: [{ color: DieColor.Blue, time: 3 }],
    prestigeValue: 3, isHighProfile: false, category: "engineering",
  },
  {
    id: "wo-a-003", type: CardType.WorkOrder, name: "Electrical Panel Refit", phase: "A",
    materialCost: 1, laborRequirements: [{ color: DieColor.Yellow, time: 2 }],
    prestigeValue: 2, isHighProfile: false, category: "engineering",
  },
  {
    id: "wo-a-004", type: CardType.WorkOrder, name: "CIWS Maintenance", phase: "A",
    materialCost: 2, laborRequirements: [{ color: DieColor.Green, time: 3 }],
    prestigeValue: 3, isHighProfile: false, category: "combat",
  },
  {
    id: "wo-a-005", type: CardType.WorkOrder, name: "Paint & Preservation", phase: "A",
    materialCost: 1, laborRequirements: [{ color: DieColor.Gray, time: 2 }],
    prestigeValue: 1, isHighProfile: false, category: "general",
  },
  {
    id: "wo-a-006", type: CardType.WorkOrder, name: "Valve Replacement", phase: "A",
    materialCost: 2, laborRequirements: [{ color: DieColor.Blue, time: 2 }, { color: DieColor.Gray, time: 1 }],
    prestigeValue: 3, isHighProfile: false, category: "engineering",
  },
  {
    id: "wo-a-007", type: CardType.WorkOrder, name: "Fire Suppression Test", phase: "A",
    materialCost: 1, laborRequirements: [{ color: DieColor.Yellow, time: 2 }],
    prestigeValue: 2, isHighProfile: false, category: "general",
  },
  {
    id: "wo-a-008", type: CardType.WorkOrder, name: "Rudder Inspection", phase: "A",
    materialCost: 2, laborRequirements: [{ color: DieColor.Red, time: 3 }],
    prestigeValue: 3, isHighProfile: false, category: "propulsion",
  },
  {
    id: "wo-a-009", type: CardType.WorkOrder, name: "Weapons Magazine Audit", phase: "A",
    materialCost: 1, laborRequirements: [{ color: DieColor.Green, time: 2 }],
    prestigeValue: 2, isHighProfile: false, category: "combat",
  },
  {
    id: "wo-a-010", type: CardType.WorkOrder, name: "Radar Calibration", phase: "A",
    materialCost: 3, laborRequirements: [{ color: DieColor.Green, time: 3 }, { color: DieColor.Yellow, time: 2 }],
    prestigeValue: 5, isHighProfile: true, category: "combat",
  },
  {
    id: "wo-a-011", type: CardType.WorkOrder, name: "Anchor Windlass Service", phase: "A",
    materialCost: 1, laborRequirements: [{ color: DieColor.Red, time: 2 }],
    prestigeValue: 2, isHighProfile: false, category: "general",
  },
  {
    id: "wo-a-012", type: CardType.WorkOrder, name: "Generator Overhaul", phase: "A",
    materialCost: 3, laborRequirements: [{ color: DieColor.Blue, time: 3 }, { color: DieColor.Yellow, time: 2 }],
    prestigeValue: 5, isHighProfile: true, category: "engineering",
  },
  {
    id: "wo-a-013", type: CardType.WorkOrder, name: "Shaft Alignment Check", phase: "A",
    materialCost: 2, laborRequirements: [{ color: DieColor.Red, time: 3 }],
    prestigeValue: 3, isHighProfile: false, category: "propulsion",
  },
  {
    id: "wo-a-014", type: CardType.WorkOrder, name: "Combat System Interface", phase: "A",
    materialCost: 2, laborRequirements: [{ color: DieColor.Green, time: 2 }, { color: DieColor.Gray, time: 1 }],
    prestigeValue: 3, isHighProfile: false, category: "combat",
  },
  {
    id: "wo-a-015", type: CardType.WorkOrder, name: "Berthing Repair", phase: "A",
    materialCost: 1, laborRequirements: [{ color: DieColor.Gray, time: 2 }],
    prestigeValue: 1, isHighProfile: false, category: "general",
  },
  {
    id: "wo-a-016", type: CardType.WorkOrder, name: "Fuel System Test", phase: "A",
    materialCost: 2, laborRequirements: [{ color: DieColor.Blue, time: 2 }],
    prestigeValue: 2, isHighProfile: false, category: "propulsion",
  },
  {
    id: "wo-a-017", type: CardType.WorkOrder, name: "Communication Array", phase: "A",
    materialCost: 2, laborRequirements: [{ color: DieColor.Yellow, time: 3 }],
    prestigeValue: 3, isHighProfile: false, category: "general",
  },
  {
    id: "wo-a-018", type: CardType.WorkOrder, name: "Torpedo Tube Service", phase: "A",
    materialCost: 3, laborRequirements: [{ color: DieColor.Green, time: 4 }],
    prestigeValue: 4, isHighProfile: false, category: "combat",
  },
  {
    id: "wo-a-019", type: CardType.WorkOrder, name: "Propeller Inspection", phase: "A",
    materialCost: 2, laborRequirements: [{ color: DieColor.Red, time: 2 }, { color: DieColor.Blue, time: 2 }],
    prestigeValue: 4, isHighProfile: false, category: "propulsion",
  },
  {
    id: "wo-a-020", type: CardType.WorkOrder, name: "AC Plant Repair", phase: "A",
    materialCost: 2, laborRequirements: [{ color: DieColor.Blue, time: 2 }, { color: DieColor.Yellow, time: 1 }],
    prestigeValue: 3, isHighProfile: false, category: "engineering",
  },
];

// --- Work Orders: Phase B (Late game, harder jobs) ---

export const workOrdersPhaseB: WorkOrderCard[] = [
  {
    id: "wo-b-001", type: CardType.WorkOrder, name: "Main Engine Rebuild", phase: "B",
    materialCost: 4, laborRequirements: [{ color: DieColor.Blue, time: 4 }, { color: DieColor.Red, time: 3 }, { color: DieColor.Gray, time: 2 }],
    prestigeValue: 8, isHighProfile: true, category: "propulsion",
  },
  {
    id: "wo-b-002", type: CardType.WorkOrder, name: "Aegis System Upgrade", phase: "B",
    materialCost: 4, laborRequirements: [{ color: DieColor.Green, time: 4 }, { color: DieColor.Yellow, time: 3 }],
    prestigeValue: 7, isHighProfile: true, category: "combat",
  },
  {
    id: "wo-b-003", type: CardType.WorkOrder, name: "Hull Replating", phase: "B",
    materialCost: 3, laborRequirements: [{ color: DieColor.Red, time: 4 }, { color: DieColor.Red, time: 3 }],
    prestigeValue: 6, isHighProfile: false, category: "general",
  },
  {
    id: "wo-b-004", type: CardType.WorkOrder, name: "Reactor Maintenance", phase: "B",
    materialCost: 5, laborRequirements: [{ color: DieColor.Blue, time: 5 }, { color: DieColor.Yellow, time: 3 }, { color: DieColor.Gray, time: 2 }],
    prestigeValue: 10, isHighProfile: true, category: "engineering",
  },
  {
    id: "wo-b-005", type: CardType.WorkOrder, name: "Sonar Array Refit", phase: "B",
    materialCost: 3, laborRequirements: [{ color: DieColor.Green, time: 3 }, { color: DieColor.Yellow, time: 3 }],
    prestigeValue: 6, isHighProfile: false, category: "combat",
  },
  {
    id: "wo-b-006", type: CardType.WorkOrder, name: "Steering Gear Overhaul", phase: "B",
    materialCost: 3, laborRequirements: [{ color: DieColor.Red, time: 3 }, { color: DieColor.Blue, time: 3 }],
    prestigeValue: 6, isHighProfile: false, category: "propulsion",
  },
  {
    id: "wo-b-007", type: CardType.WorkOrder, name: "Full Weapons Load", phase: "B",
    materialCost: 4, laborRequirements: [{ color: DieColor.Green, time: 4 }, { color: DieColor.Gray, time: 2 }],
    prestigeValue: 7, isHighProfile: true, category: "combat",
  },
  {
    id: "wo-b-008", type: CardType.WorkOrder, name: "Boiler Retube", phase: "B",
    materialCost: 4, laborRequirements: [{ color: DieColor.Blue, time: 4 }, { color: DieColor.Red, time: 2 }],
    prestigeValue: 6, isHighProfile: false, category: "engineering",
  },
  {
    id: "wo-b-009", type: CardType.WorkOrder, name: "Flight Deck Resurfacing", phase: "B",
    materialCost: 3, laborRequirements: [{ color: DieColor.Red, time: 3 }, { color: DieColor.Gray, time: 3 }],
    prestigeValue: 5, isHighProfile: false, category: "general",
  },
  {
    id: "wo-b-010", type: CardType.WorkOrder, name: "Complete Power Conversion", phase: "B",
    materialCost: 5, laborRequirements: [{ color: DieColor.Yellow, time: 4 }, { color: DieColor.Blue, time: 4 }, { color: DieColor.Gray, time: 2 }],
    prestigeValue: 10, isHighProfile: true, category: "engineering",
  },
];

// --- BAWP Cards (Initial tasks — simpler) ---

export const bawpCards: BAWPCard[] = [
  {
    id: "bawp-001", type: CardType.BAWP, name: "Safety Walkdown",
    materialCost: 0, laborRequirements: [{ color: DieColor.Gray, time: 1 }],
    prestigeValue: 1, isHighProfile: false, category: "general",
  },
  {
    id: "bawp-002", type: CardType.BAWP, name: "Tag-Out Verification",
    materialCost: 0, laborRequirements: [{ color: DieColor.Yellow, time: 1 }],
    prestigeValue: 1, isHighProfile: false, category: "general",
  },
  {
    id: "bawp-003", type: CardType.BAWP, name: "Compartment Check",
    materialCost: 1, laborRequirements: [{ color: DieColor.Red, time: 2 }],
    prestigeValue: 2, isHighProfile: false, category: "general",
  },
  {
    id: "bawp-004", type: CardType.BAWP, name: "Piping Survey",
    materialCost: 1, laborRequirements: [{ color: DieColor.Blue, time: 2 }],
    prestigeValue: 2, isHighProfile: false, category: "engineering",
  },
  {
    id: "bawp-005", type: CardType.BAWP, name: "Weapons Safe Check",
    materialCost: 0, laborRequirements: [{ color: DieColor.Green, time: 1 }],
    prestigeValue: 1, isHighProfile: false, category: "combat",
  },
  {
    id: "bawp-006", type: CardType.BAWP, name: "Cable Tray Survey",
    materialCost: 1, laborRequirements: [{ color: DieColor.Yellow, time: 2 }],
    prestigeValue: 2, isHighProfile: false, category: "engineering",
  },
  {
    id: "bawp-007", type: CardType.BAWP, name: "Topside Preservation",
    materialCost: 1, laborRequirements: [{ color: DieColor.Red, time: 1 }],
    prestigeValue: 1, isHighProfile: false, category: "general",
  },
  {
    id: "bawp-008", type: CardType.BAWP, name: "Initial Machinery Check",
    materialCost: 0, laborRequirements: [{ color: DieColor.Blue, time: 1 }],
    prestigeValue: 1, isHighProfile: false, category: "propulsion",
  },
  {
    id: "bawp-009", type: CardType.BAWP, name: "Firefighting Gear Audit",
    materialCost: 0, laborRequirements: [{ color: DieColor.Gray, time: 2 }],
    prestigeValue: 2, isHighProfile: false, category: "general",
  },
  {
    id: "bawp-010", type: CardType.BAWP, name: "Combat Direction Center Survey",
    materialCost: 1, laborRequirements: [{ color: DieColor.Green, time: 2 }],
    prestigeValue: 2, isHighProfile: false, category: "combat",
  },
];

// --- Growth Work Cards (complications from failed inspections) ---

export const growthWorkCards: GrowthWorkCard[] = [
  {
    id: "gw-001", type: CardType.GrowthWork, name: "Hidden Corrosion",
    materialCost: 2, laborRequirements: [{ color: DieColor.Red, time: 3 }],
    prestigeValue: 2, isHighProfile: false,
  },
  {
    id: "gw-002", type: CardType.GrowthWork, name: "Wiring Degradation",
    materialCost: 1, laborRequirements: [{ color: DieColor.Yellow, time: 2 }],
    prestigeValue: 1, isHighProfile: false,
  },
  {
    id: "gw-003", type: CardType.GrowthWork, name: "Bearing Failure",
    materialCost: 2, laborRequirements: [{ color: DieColor.Blue, time: 3 }],
    prestigeValue: 2, isHighProfile: false,
  },
  {
    id: "gw-004", type: CardType.GrowthWork, name: "Cracked Mounting",
    materialCost: 2, laborRequirements: [{ color: DieColor.Red, time: 2 }, { color: DieColor.Gray, time: 1 }],
    prestigeValue: 2, isHighProfile: false,
  },
  {
    id: "gw-005", type: CardType.GrowthWork, name: "Contaminated Fuel Line",
    materialCost: 3, laborRequirements: [{ color: DieColor.Blue, time: 3 }, { color: DieColor.Gray, time: 1 }],
    prestigeValue: 3, isHighProfile: false,
  },
  {
    id: "gw-006", type: CardType.GrowthWork, name: "Software Fault",
    materialCost: 0, laborRequirements: [{ color: DieColor.Green, time: 2 }],
    prestigeValue: 1, isHighProfile: false,
  },
  {
    id: "gw-007", type: CardType.GrowthWork, name: "Asbestos Abatement",
    materialCost: 3, laborRequirements: [{ color: DieColor.Gray, time: 4 }],
    prestigeValue: 3, isHighProfile: false,
  },
  {
    id: "gw-008", type: CardType.GrowthWork, name: "Structural Weld Repair",
    materialCost: 2, laborRequirements: [{ color: DieColor.Red, time: 3 }],
    prestigeValue: 2, isHighProfile: false,
  },
];

// --- Event Cards: Deck I (Rounds 1-6, generally milder) ---

export const eventCardsI: EventCard[] = [
  {
    id: "ev-i-001", type: CardType.Event, name: "Supply Ship Arrives", deck: "I",
    persistence: EventPersistence.Instant,
    description: "A supply vessel delivers extra material. All players gain 1 Material.",
    effect: { materialChange: 1 },
  },
  {
    id: "ev-i-002", type: CardType.Event, name: "Budget Review", deck: "I",
    persistence: EventPersistence.Instant,
    description: "Congress reviews funding. All players lose $2 Funding.",
    effect: { fundingChange: -2 },
  },
  {
    id: "ev-i-003", type: CardType.Event, name: "Safety Stand-Down", deck: "I",
    persistence: EventPersistence.Instant,
    description: "Mandatory safety training slows work. SI -2.",
    effect: { siChange: -2 },
  },
  {
    id: "ev-i-004", type: CardType.Event, name: "Favorable Weather", deck: "I",
    persistence: EventPersistence.Instant,
    description: "Good weather boosts morale. SI +2.",
    effect: { siChange: 2 },
  },
  {
    id: "ev-i-005", type: CardType.Event, name: "Equipment Breakdown", deck: "I",
    persistence: EventPersistence.Instant,
    description: "A crane goes down. All players lose 1 Material.",
    effect: { materialChange: -1 },
  },
  {
    id: "ev-i-006", type: CardType.Event, name: "Admiral's Visit", deck: "I",
    persistence: EventPersistence.Instant,
    description: "The Admiral tours the yard. SI +3 if at least one High Profile job is in progress.",
    effect: { special: "admiralVisit" },
  },
  {
    id: "ev-i-007", type: CardType.Event, name: "Union Dispute", deck: "I",
    persistence: EventPersistence.Instant,
    description: "Workers demand hazard pay. All players lose $1 Funding.",
    effect: { fundingChange: -1 },
  },
  {
    id: "ev-i-008", type: CardType.Event, name: "New Contract Award", deck: "I",
    persistence: EventPersistence.Instant,
    description: "Government confidence rises. SI +1, all players gain $1.",
    effect: { siChange: 1, fundingChange: 1 },
  },
];

// --- Event Cards: Deck II (Rounds 7-12, can be persistent) ---

export const eventCardsII: EventCard[] = [
  {
    id: "ev-ii-001", type: CardType.Event, name: "Hurricane Warning", deck: "II",
    persistence: EventPersistence.Persistent,
    description: "Storm approaching. All procurement yields 1 less until cleared.",
    effect: { special: "hurricaneWarning" },
    clearCost: { funding: 4 },
  },
  {
    id: "ev-ii-002", type: CardType.Event, name: "Congressional Audit", deck: "II",
    persistence: EventPersistence.Persistent,
    description: "Auditors on site. Cross-training costs $1 extra until cleared.",
    effect: { special: "congressionalAudit" },
    clearCost: { funding: 3, material: 1 },
  },
  {
    id: "ev-ii-003", type: CardType.Event, name: "Material Shortage", deck: "II",
    persistence: EventPersistence.Instant,
    description: "Supply chain disruption. All players lose 2 Material.",
    effect: { materialChange: -2 },
  },
  {
    id: "ev-ii-004", type: CardType.Event, name: "Emergency Deployment Order", deck: "II",
    persistence: EventPersistence.Instant,
    description: "Pressure from the fleet. SI -4.",
    effect: { siChange: -4 },
  },
  {
    id: "ev-ii-005", type: CardType.Event, name: "Experienced Crew Arrives", deck: "II",
    persistence: EventPersistence.Instant,
    description: "Veteran workers boost efficiency. All players gain $3.",
    effect: { fundingChange: 3 },
  },
  {
    id: "ev-ii-006", type: CardType.Event, name: "Dock Flooding", deck: "II",
    persistence: EventPersistence.Persistent,
    description: "Water in the drydock. One staged slot per player is locked until cleared.",
    effect: { special: "dockFlooding" },
    clearCost: { material: 3 },
  },
  {
    id: "ev-ii-007", type: CardType.Event, name: "Inspector General Visit", deck: "II",
    persistence: EventPersistence.Instant,
    description: "IG reviews quality. If SI > 20, gain +3 SI. If SI < 10, lose 3 SI.",
    effect: { special: "igVisit" },
  },
  {
    id: "ev-ii-008", type: CardType.Event, name: "Budget Supplement", deck: "II",
    persistence: EventPersistence.Instant,
    description: "Emergency funding approved. All players gain $4.",
    effect: { fundingChange: 4 },
  },
];

// --- Foreman Upgrade Cards ---

export const foremanCards: ForemanCard[] = [
  {
    id: "fm-001", type: CardType.Foreman, name: "Master Shipfitter",
    description: "Hull work costs 1 less Material (min 0).",
    ability: "hullDiscount",
  },
  {
    id: "fm-002", type: CardType.Foreman, name: "Chief Electrician",
    description: "Electrical dice assignments cost no wages.",
    ability: "electricianFreeWages",
  },
  {
    id: "fm-003", type: CardType.Foreman, name: "Logistics Coordinator",
    description: "Procurement yields 1 extra (Funding or Material).",
    ability: "procurementBonus",
  },
  {
    id: "fm-004", type: CardType.Foreman, name: "Veteran Supervisor",
    description: "Cross-training fee reduced by $1.",
    ability: "crossTrainingDiscount",
  },
  {
    id: "fm-005", type: CardType.Foreman, name: "Quality Inspector",
    description: "On Growth Work CFR draw, you may pay $2 to re-draw once.",
    ability: "cfrRedraw",
  },
  {
    id: "fm-006", type: CardType.Foreman, name: "Expeditor",
    description: "Once per round, reduce one of your assigned dice by 1 for free.",
    ability: "freeCountdown",
  },
];

// --- Ship Contract Cards ---

export const shipContracts: ShipContractCard[] = [
  {
    id: "sc-001", type: CardType.ShipContract, name: "DDG-51 Arleigh Burke", side: ContractSide.A,
    startingDice: [DieColor.Red, DieColor.Blue, DieColor.Yellow, DieColor.Green, DieColor.Gray],
    milestones: {
      round6: { quotas: { combat: 1 } },
      round8: { quotas: { propulsion: 1, engineering: 1 } },
      round10: { quotas: { combat: 2, propulsion: 1, engineering: 2, general: 1 } },
    },
  },
  {
    id: "sc-002", type: CardType.ShipContract, name: "CG-47 Ticonderoga", side: ContractSide.A,
    startingDice: [DieColor.Green, DieColor.Green, DieColor.Blue, DieColor.Yellow, DieColor.Gray],
    milestones: {
      round6: { quotas: { combat: 2 } },
      round8: { quotas: { engineering: 1 } },
      round10: { quotas: { combat: 3, engineering: 2, general: 1 } },
    },
  },
  {
    id: "sc-003", type: CardType.ShipContract, name: "LPD-17 San Antonio", side: ContractSide.A,
    startingDice: [DieColor.Red, DieColor.Red, DieColor.Blue, DieColor.Gray, DieColor.Gray],
    milestones: {
      round6: { quotas: { general: 1 } },
      round8: { quotas: { propulsion: 1 } },
      round10: { quotas: { general: 3, propulsion: 2, engineering: 1 } },
    },
  },
  {
    id: "sc-004", type: CardType.ShipContract, name: "SSN-774 Virginia", side: ContractSide.B,
    startingDice: [DieColor.Blue, DieColor.Blue, DieColor.Yellow, DieColor.Green, DieColor.Gray],
    milestones: {
      round6: { quotas: { engineering: 2 } },
      round8: { quotas: { combat: 1, propulsion: 1 } },
      round10: { quotas: { engineering: 3, combat: 2, propulsion: 2, general: 1 } },
    },
  },
  {
    id: "sc-005", type: CardType.ShipContract, name: "CVN-78 Gerald R. Ford", side: ContractSide.B,
    startingDice: [DieColor.Red, DieColor.Blue, DieColor.Yellow, DieColor.Green, DieColor.Gray],
    milestones: {
      round6: { quotas: { combat: 1, engineering: 1 } },
      round8: { quotas: { propulsion: 1, general: 1 } },
      round10: { quotas: { combat: 2, engineering: 2, propulsion: 2, general: 2 } },
    },
  },
  {
    id: "sc-006", type: CardType.ShipContract, name: "LCS-1 Freedom", side: ContractSide.A,
    startingDice: [DieColor.Red, DieColor.Blue, DieColor.Yellow, DieColor.Green, DieColor.Gray],
    milestones: {
      round6: { quotas: { general: 1 } },
      round8: { quotas: { engineering: 1 } },
      round10: { quotas: { general: 2, engineering: 2, combat: 1, propulsion: 1 } },
    },
  },
];

// --- Admiral's Mandate Cards ---

export const admiralMandates: AdmiralMandateCard[] = [
  {
    id: "am-001", type: CardType.AdmiralMandate, name: "Cost Efficiency Drive",
    description: "All Procurement actions yield 1 less Funding (min $2).",
    rule: "reducedProcurement",
  },
  {
    id: "am-002", type: CardType.AdmiralMandate, name: "Combat Readiness Priority",
    description: "Combat category work orders grant +1 PP when completed.",
    rule: "combatBonus",
  },
  {
    id: "am-003", type: CardType.AdmiralMandate, name: "Safety First",
    description: "Growth Work cards cost 1 less Material (min 0) but the team loses 1 SI when one is drawn.",
    rule: "safetyFirst",
  },
  {
    id: "am-004", type: CardType.AdmiralMandate, name: "Accelerated Timeline",
    description: "Milestone deadlines are 1 round earlier (Rounds 5, 7, 9). Higher pressure, higher stakes.",
    rule: "acceleratedTimeline",
  },
  {
    id: "am-005", type: CardType.AdmiralMandate, name: "Open Books Policy",
    description: "All players' hands (AWP) are visible to all other players.",
    rule: "openBooks",
  },
];
