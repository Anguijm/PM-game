# Project Blueprint — Drydock Masters

> Single source of truth for project state and priorities.

## Architecture & Stack

- **Framework:** Next.js 16 (App Router, webpack) + Boardgame.io
- **Language:** TypeScript (strict)
- **Frontend:** React 19 + Tailwind CSS 4 + Framer Motion
- **Testing:** Vitest (63 unit tests) + Playwright (E2E, 10/10 complete games pass)
- **Audio:** Procedurally generated WAV SFX + Gemini TTS voiceover
- **Video:** Remotion (programmatic video rendering)
- **Hosting:** Vercel (frontend) + Render (game server)
- **Design:** Naval/industrial — dark navy, steel gray, amber accents

## Live URLs

- **Frontend:** https://pm-game-flame.vercel.app
- **Game Server:** Render
- **GitHub:** https://github.com/Anguijm/PM-game

## Current Status: Tier 1 Complete — Deployed

All core features built, balanced, tested, and deployed. Local play works. Online multiplayer pending game server fix.

## Tech Debt

- Duplicate card IDs in hand (key warning fixed, root cause deferred)
- CFR bag shuffle uses deterministic RNG in production (fixed)

## Completed Work

### Game Engine
- [x] 5-phase state machine: Contract Selection → Planning (incl. Event) → Action → Resolution → loop
- [x] 13 moves: selectContract, draftCard, stageWork, assignLabor, procurement, coordinate, analyzeMarket, hireForeman, clearObstruction, trade, emergencyOvertime, expeditedShipping, pass
- [x] Event special effects: admiralVisit, igVisit, hurricaneWarning, congressionalAudit, dockFlooding
- [x] 6 foreman abilities: hullDiscount, electricianFreeWages, procurementBonus, crossTrainingDiscount, cfrRedraw, freeCountdown
- [x] 5 admiral mandates: reducedProcurement, combatBonus, safetyFirst, acceleratedTimeline, openBooks
- [x] Persistent problem SI drain (-1/round each)
- [x] Growth work fail-forward (team -1 SI, player +2 PP, +$2)
- [x] PP compression (scaled by player count)
- [x] Cumulative milestone system with player-count scaling
- [x] Deterministic RNG via boardgame.io random.Shuffle

### Card Data
- [x] 20 Phase A + 10 Phase B work orders
- [x] 10 BAWP cards, 8 growth work cards
- [x] 8+8 event cards (Deck I + II)
- [x] 6 foreman cards, 6 ship contracts (3 Side-A, 3 Side-B), 5 admiral mandates

### UI (30+ components)
- [x] GameBoard, TopBar, SITracker, GameOver (with badges)
- [x] PhasePanel, PlanningPhaseView, ActionPhaseView, ResolutionPhaseView
- [x] ContractSelectionView
- [x] PlayerBoard, DrydockSlot, DicePool, ResourceBar, HandPanel
- [x] PlayerSwitcher (Pass Device for hot-seat)
- [x] OpponentSummary, MilestoneTracker
- [x] WorkOrderCard, EventCardDisplay, ForemanCard, LaborDie
- [x] MarketPanel, TradeModal
- [x] Toast, ActionModeBar, VolumeControl
- [x] MobileNav, MobileHandDrawer, MobileDiceBar
- [x] TutorialOverlay
- [x] GameUIContext (action mode state machine)
- [x] SoundProvider (10 procedural SFX)

### Multiplayer & Bots
- [x] Local hot-seat with Pass Device info hiding (skips bots)
- [x] Online multiplayer via room codes (SocketIO)
- [x] 5 AI bot strategies: balanced, aggressive, cautious, rush, hoarder
- [x] Bot interval polling with stuck detection + force-pass
- [x] Bot contract selection (aggressive → Side-B, others → Side-A)
- [x] Bot milestone awareness (hoarder pivots to rush near deadlines)

### Balance (3,400+ simulated games)
- [x] 34 tuning batches with Gemini collaborative review
- [x] 55% win rate (2P=53%, 3P=55%, 4P=60%)
- [x] SI thresholds triggered in 37% of games
- [x] 100 trades, 50 team actions, 185 obstructions cleared per 100 games
- [x] PP compression, persistent problem drain, growth work compensation

### Testing
- [x] 63 Vitest unit tests (setup, moves, resolution)
- [x] Playwright E2E: 10/10 complete games to conclusion (avg 27s each)
- [x] Playwright mobile viewport test (375x812)
- [x] Playtest batch simulation (100-game batches)
- [x] Gemini code audits: 14+ rounds across engine + UI

### Polish
- [x] Framer Motion animations (dice countdown, phase transitions, card hover, game over, SI gauge spring)
- [x] 10 procedurally generated sound effects (click, clunk, tick, chime, buzz, alarm, whoosh, stamp, fanfare, defeat)
- [x] Volume control + mute toggle
- [x] Mobile responsive (bottom nav, collapsible hand drawer, persistent dice bar, 2-col slots, safe area insets)
- [x] Tutorial: 18-step guided walkthrough with "The Foreman" narrator + spotlight overlay
- [x] Post-game stats: 6 superlative badges (Dock Master, Iron Will, Speed Runner, The Cleaner, Paper Pusher, Growth Survivor)
- [x] Contract selection phase (Side A vs B choice)

### Marketing
- [x] Key art (4K, Gemini-generated)
- [x] AI teaser video (8s, Gemini Veo)
- [x] Remotion trailer (22s, game UI showcase)
- [x] Gameplay Overview video (55s, Algenib voiceover, 4 scenes)
- [x] The Tension video (30s, Gacrux voiceover, 3 scenes)
- [x] All scripts Gemini creative-director approved (v2)

### Deployment
- [x] Vercel frontend config (vercel.json, webpack build)
- [x] Render game server config (render.yaml, CORS)
- [x] Environment variables (NEXT_PUBLIC_GAME_SERVER, FRONTEND_URL)
- [x] Cold-start loading UI for Render free tier

## Backlog — Tier 2 (Retention)

| # | Item | Impact | Effort |
|---|------|--------|--------|
| 1 | Daily Challenge (global seed, fixed scenario, leaderboard) | High | Medium |
| 2 | Accounts (Supabase — Google/Discord OAuth, guest play first) | High | Medium |
| 3 | Emote/Ping wheel (6-8 pre-set phrases for online play) | Medium | Low |
| 4 | Achievements (10+ trackable goals) | Medium | Medium |
| 5 | Public lobby browser (boardgame.io lobby API) | High | Medium |

## Backlog — Tier 3 (Expansion)

| # | Item | Impact | Effort |
|---|------|--------|--------|
| 1 | Hidden per-player objectives (secret goals, paranoia) | High | Medium |
| 2 | More cards + contracts (expand beyond MVP set) | Medium | Medium |
| 3 | Steam release (Tauri wrapper + Steamworks) | High | High |
| 4 | Analytics (PostHog — track tutorial dropoff, round engagement) | Medium | Low |
| 5 | Cosmetic supporter pack ($4.99 — card backs, avatars) | Medium | Low |
| 6 | Score timeline graph (per-round PP tracking) | Medium | Medium |
| 7 | Async play (take turn, get notified) | High | High |
| 8 | Tournament mode (8-player bracket) | Medium | High |

## Someday/Maybe

- Spectator mode with commentary
- Modding support (custom cards/events)
- Campaign/legacy mode
- Localization (i18n)
