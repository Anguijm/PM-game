# Project Blueprint — Drydock Masters

> This is the **single source of truth** for project state and priorities.
> CLAUDE.md defines how you work. This file defines what you work on.

## Architecture & Stack

- **Framework:** Next.js 16 + Boardgame.io (game engine)
- **Language:** TypeScript (strict)
- **Frontend:** React 19 + Tailwind CSS 4 + Framer Motion
- **Testing:** Vitest + Testing Library
- **Key Patterns:** Boardgame.io state machine (phases/turns/moves), immutable game state via move reducers
- **Design System:** Naval/industrial theme — dark blues, steel grays, amber warnings

## Game Overview

**Drydock Masters** is a semi-cooperative logistics board game (2-6 players, 12 rounds).
Players manage Labor Dice as countdown timers and limited drydock space to complete Work Orders.
Shared Shipyard Integrity (SI) + Individual Prestige Points (PP) = semi-cooperative tension.

## Current P0s (Blockers)

*(None)*

## Active Sprint

**Epic:** Foundation Build — Game Engine + UI MVP
**Status:** COMPLETE
**Goal:** Playable MVP with core game loop

### Tasks
- [x] Project initialization (Node/TS/React/Boardgame.io)
- [x] TypeScript game state interfaces (types.ts)
- [x] Core Boardgame.io game definition with 4 phases
- [x] Player action move reducers (9 actions + free trades + team actions)
- [x] Resolution phase logic (utilization, countdown, CFR inspection, milestones)
- [x] Card data — MVP set (20 Phase A, 10 Phase B, 10 BAWP, 8 Growth, 8+8 Events, 6 Foreman, 6 Contracts, 5 Mandates)
- [x] React UI — 22 components (GameBoard, DrydockSlot, WorkOrderCard, LaborDie, etc.)
- [x] Boardgame.io client integration (local hot-seat multiplayer with Pass Device)
- [x] Phase-specific views (Event, Planning draft, Action panel, Resolution summary)
- [x] Trade modal + Coordinate flow + Team actions with die picker
- [x] GameUIContext (action mode state machine, toast notifications)
- [x] OpponentSummary + GameOver with score breakdown

## Tech Debt

- CFR bag replenishment uses `Math.random()` — needs deterministic RNG (boardgame.io `ctx.random.Shuffle`) for multiplayer sync. Acceptable for local play.

## Backlog (Prioritized)

1. Online multiplayer via room codes (Boardgame.io lobby)
2. ~~Event card special effects~~ — DONE: admiralVisit (+3 SI), igVisit (conditional ±3 SI), hurricaneWarning (-1 procurement), congressionalAudit (+$1 cross-train), dockFlooding (locks slot 4)
3. ~~Foreman ability enforcement~~ — DONE: hullDiscount, electricianFreeWages, procurementBonus, crossTrainingDiscount, cfrRedraw, freeCountdown
4. ~~Admiral's Mandate rule modifiers~~ — DONE: reducedProcurement, combatBonus, safetyFirst, acceleratedTimeline, openBooks (UI-only)
5. ~~Card balance pass~~ — DONE: 26 batches, 2,600+ games. See BALANCE_REPORT.md
6. Sound effects and polish animations (Framer Motion)
7. ~~AI opponents~~ — DONE: 5 strategies (balanced, aggressive, cautious, rush, hoarder) selectable in lobby
8. Side-B contract support
9. ~~Milestone progress tracker UI~~ — DONE: shows contract name, 3 milestones, progress/needed/passed/failed

## Someday/Maybe

- Persistent leaderboards / match history (PostgreSQL)
- Spectator mode
- Mobile-responsive layout
- Tutorial / guided first game

## Recently Completed

### 2026-03-28 — Full UI MVP (6 phases, 6 Gemini audits)
- **Feature:** 22 React components, Boardgame.io local multiplayer, hot-seat with Pass Device info hiding, GameUIContext action state machine, all 4 game phases interactive, trade modal, coordinate flow, team actions, opponent summary, game over with score breakdown
- **Tests:** 63 passing (engine unchanged)
- **Audit:** 6 rounds with Gemini (1 per phase). All CLEAR after fixes. Key fixes: React strict mode lifecycle, dice lookup O(1) map, toast race condition, stale action mode reset, Pass Device portal + opacity, coordinate player picker for 3+ players.
- **Components:** GameBoard, TopBar, SITracker, GameOver, PhasePanel, EventPhaseView, PlanningPhaseView, ActionPhaseView, ResolutionPhaseView, PlayerBoard, DrydockSlot, DicePool, ResourceBar, HandPanel, PlayerSwitcher, OpponentSummary, WorkOrderCard, EventCardDisplay, ForemanCard, LaborDie, MarketPanel, Toast, ActionModeBar, TradeModal

### 2026-03-28 — Gemini audit fixes (round 2)
- **Fix:** 10 bugs/edge cases from Gemini audit: originalValue for PP distribution, pass move, CFR bag replenishment, utilization bonus vacuous truth, SI boundary checks, trade validation, emergencyOvertime clamping, hasPassed guards, nullish coalescing
- **Tests:** 63 passing (setup + moves + resolution)
- **Audit:** 2 rounds with Gemini. Round 2 CLEAR with minor advisory notes (deterministic RNG for multiplayer)

### 2026-03-27 — Foundation engine build
- **Feature:** Complete game engine with TypeScript types, Boardgame.io phases, all move reducers, resolution logic, and MVP card data
- **Tests:** 13 passing (setup validation)
- **Files:** `src/game/types.ts`, `setup.ts`, `moves.ts`, `resolution.ts`, `index.ts`, `src/data/cards.ts`
