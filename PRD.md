# Product Requirements Document — Drydock Masters

**Version:** 1.0
**Date:** 2026-03-29
**Author:** John Anguiano + Claude (Architect) + Gemini (Auditor)

---

## 1. Product Overview

**Drydock Masters** is a semi-cooperative digital board game where 2-6 players take on the role of Shipyard Superintendents managing the overhaul of a naval fleet. Players must collaborate to keep shared Shipyard Integrity (SI) above zero while competing individually for Prestige Points (PP) to earn a promotion to Dock Master.

**Tagline:** *The fleet won't wait.*

**Genre:** Semi-cooperative logistics / Euro-style board game
**Platform:** Web (desktop + mobile), planned Steam release
**Pricing:** Free-to-play (web), optional Supporter Pack ($4.99)

---

## 2. Target Audience

- Fans of mid-weight Euro board games (Terraforming Mars, Wingspan, Pandemic, Spirit Island)
- Digital tabletop enthusiasts (Board Game Arena, Tabletop Simulator communities)
- Strategy game players who enjoy social deduction and negotiation
- Age: 16+, comfortable with moderate complexity

---

## 3. Core Game Mechanics

### 3.1 Semi-Cooperative Tension
Players share a Shipyard Integrity bar. If it hits zero, **everyone loses**. But only the player with the most Prestige Points wins. This creates constant tension: help the team or chase personal glory?

### 3.2 Labor Dice (Countdown Timers)
Each player has 5 colored dice. Assigning a die to a Work Order starts a countdown. Each round, all assigned dice tick down by 1. When a die reaches 0, the job is complete and undergoes inspection.

### 3.3 Condition Found Reports (CFR Bag)
When a job completes, the player draws from the CFR bag:
- 85% chance: Clear — job succeeds, earn PP
- 15% chance: Growth Work found — additional complications require more work, team loses SI

### 3.4 Persistent Problems
Event cards can create persistent problems that drain SI every round until cleared. Clearing problems costs an action but rewards PP, creating a competitive incentive to do the "altruistic" thing.

### 3.5 Milestones & Contracts
Each player has a Ship Contract with cumulative job quotas checked at Rounds 6, 8, and 10. Missing a milestone hurts the team's SI. Meeting it rewards PP.

### 3.6 Game Flow
```
Contract Selection → [Planning (Event + Draft) → Action → Resolution] × 12 rounds → Game Over
```

---

## 4. What's Been Built (v1.0)

### 4.1 Game Engine
- Complete Boardgame.io state machine with 5 phases
- 13 player moves with full validation
- 5 event special effects, 6 foreman abilities, 5 admiral mandates
- Persistent problem SI drain, growth work fail-forward, PP compression
- Deterministic RNG for multiplayer consistency
- Cumulative milestone system scaled by player count

### 4.2 Card Content (MVP)
- 30 Work Orders (20 Phase A + 10 Phase B)
- 10 BAWP cards, 8 Growth Work cards
- 16 Event cards (8 per deck)
- 6 Foreman upgrade cards
- 6 Ship Contracts (3 Side-A standard, 3 Side-B complex)
- 5 Admiral's Mandate global modifiers

### 4.3 User Interface
- 30+ React components with Framer Motion animations
- Mobile responsive (bottom nav, collapsible hand drawer, persistent dice bar)
- Naval/industrial theme (dark navy, steel gray, amber accents)
- Phase-specific views with smooth transitions
- Trade modal, coordinate flow, team action UI
- Post-game stats with 6 superlative badges

### 4.4 Multiplayer
- Local hot-seat with Pass Device information hiding
- Online room codes via boardgame.io SocketIO transport
- 5 AI bot strategies selectable in lobby (balanced, aggressive, cautious, rush, hoarder)

### 4.5 Audio
- 10 procedurally generated sound effects
- Volume control and mute toggle
- State-driven triggers (phase changes, completions, SI alarm, game over)

### 4.6 Tutorial
- 18-step guided walkthrough with "The Foreman" narrator
- Spotlight overlay highlighting relevant UI elements
- Covers: contract selection, drafting, staging, assigning labor, procurement, resolution, SI management

### 4.7 Balance
- 3,400+ simulated games across 34 tuning batches
- 55% win rate (2P=53%, 3P=55%, 4P=60%)
- SI thresholds triggered in 37% of games
- 100 trades per 100 games (interaction proven)
- Gemini collaborative review at every stage

### 4.8 Testing
- 63 Vitest unit tests (engine)
- 10/10 Playwright E2E complete games (full 12-round games to conclusion)
- Mobile viewport test
- 100-game simulation batches

### 4.9 Marketing Assets
- 4K key art (Gemini-generated)
- 4 promotional videos (AI teaser, Remotion trailer, Gameplay Overview with voiceover, The Tension with voiceover)
- All scripts creative-director approved by Gemini (v2)

### 4.10 Deployment
- Frontend: Vercel (https://pm-game-flame.vercel.app)
- Game server: Render (boardgame.io + SocketIO)
- CI: GitHub → auto-deploy on push

---

## 5. Roadmap

### Phase 1: Polish & Launch ✅ COMPLETE
- Game engine with all mechanics
- Full UI with animations and sound
- 5 AI bot strategies
- Online multiplayer
- Tutorial
- Mobile responsive
- Post-game stats and badges
- Deployed to Vercel + Render

### Phase 2: Retention (Next — Weeks 1-4)

| Feature | Description | Priority |
|---------|-------------|----------|
| **Daily Challenge** | Global daily seed, fixed scenario (specific mandate + events), play vs 3 bots, daily leaderboard | P0 |
| **Accounts** | Supabase (Google/Discord OAuth), guest play first, persistent stats | P0 |
| **Public Lobby** | boardgame.io lobby API, find open games without room codes | P1 |
| **Emote Wheel** | 6-8 pre-set phrases for online play ("Need Material!", "Betrayal!", "Good move") | P1 |
| **Achievements** | 10+ trackable goals ("Win with SI < 5", "Complete 3 high-profile jobs") | P2 |

### Phase 3: Expansion (Months 2-4)

| Feature | Description | Priority |
|---------|-------------|----------|
| **Hidden Objectives** | Secret per-player goals that create paranoia and replayability | P0 |
| **More Content** | 6+ new contracts, 20+ work orders, new foremen and events | P1 |
| **Score Timeline** | Per-round PP tracking with end-game graph (like Terraforming Mars) | P1 |
| **Analytics** | PostHog — track tutorial dropoff, round engagement, feature usage | P2 |
| **Supporter Pack** | $4.99 — cosmetic card backs, player avatars, detailed stats dashboard | P2 |

### Phase 4: Platform Growth (Months 4-6)

| Feature | Description | Priority |
|---------|-------------|----------|
| **Steam Release** | Tauri wrapper + Steamworks integration, $4.99 or free with DLC | P0 |
| **Async Play** | Take your turn, get notified when it's your turn again | P1 |
| **Tournament Mode** | 8-player bracket, best of 3 | P2 |
| **Localization** | i18n for major languages | P2 |

---

## 6. Marketing Strategy

### Target Channels
- **Reddit:** r/boardgames, r/playmygame, r/WebGames, r/digitaltabletop
- **BoardGameGeek:** Designer diary highlighting 3,400-game AI simulation process
- **Discord:** Dedicated server for community, feedback, and matchmaking
- **YouTube/Twitch:** Press kit to mid-tier board game and digital strategy game creators
- **itch.io:** Free listing for indie game discovery

### Pricing Model
- **Free-to-play** web app (no account required)
- **Supporter Pack** ($4.99): cosmetic card backs, unique foreman avatars, detailed stats
- **Steam** ($4.99 or free with DLC): platform discovery + achievements

### Launch Sequence
1. Soft launch — free web version, share in Discord/Reddit
2. Community hubs — Discord server, BGG listing, itch.io page
3. Reddit tour — GIF/video posts across 4+ subreddits
4. Press kit distribution — promo videos + key art to creators
5. Designer diary — BGG post on the AI simulation and balance process

---

## 7. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Daily Active Users | 100+ within 4 weeks of launch | Analytics |
| Session Length | 15+ minutes average | Analytics |
| Return Rate | 30% day-7 retention | Account system |
| Games Completed | 60%+ of started games finish | Game state tracking |
| Win Rate | 50-60% across all player counts | Simulation + live data |
| NPS | 40+ | In-game survey |

---

## 8. Technical Architecture

```
┌─────────────────────────────────────────┐
│           Vercel (Frontend)             │
│  Next.js 16 + React 19 + Tailwind CSS  │
│  30+ components, Framer Motion          │
│  Mobile responsive, PWA-ready           │
├─────────────────────────────────────────┤
│           Render (Game Server)          │
│  boardgame.io + SocketIO               │
│  Stateful WebSocket connections         │
│  CORS configured for Vercel domain      │
├─────────────────────────────────────────┤
│           Supabase (Planned)            │
│  PostgreSQL, Auth, Edge Functions       │
│  User accounts, daily leaderboard       │
│  Achievement tracking                   │
└─────────────────────────────────────────┘
```

---

## 9. Development Process

- **Architecture:** Claude (Opus 4.6) — primary developer
- **Auditing:** Gemini (Pro/Flash) — adversarial code reviewer, game design collaborator, creative director
- **Workflow:** Plan → Gemini audit → Execute → Gemini review results → Iterate
- **Testing:** Every feature verified via Vitest unit tests + Playwright E2E before shipping
- **Balance:** Simulated playtesting in 100-game batches with 5 AI strategy archetypes

---

## 10. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Cold start problem (no players online) | High | AI bots make solo/local play compelling; Daily Challenge drives solo retention |
| Render free tier cold starts (50s) | Medium | Loading UI with explanation; upgrade to paid tier if traction warrants |
| Balance issues at scale | Medium | Analytics + feedback loop; ability to tune constants without code changes |
| Mobile browser limitations | Low | Progressive enhancement; tested on 375px viewport |
| Competitor digital board games | Medium | Unique semi-cooperative naval theme; free-to-play web removes friction |
