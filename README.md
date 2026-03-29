# Drydock Masters

> A semi-cooperative digital board game of naval shipyard management.

**[Play Now](https://pm-game-flame.vercel.app)** | [PRD](PRD.md) | [Balance Report](BALANCE_REPORT.md)

## The Game

You're a Shipyard Superintendent. The fleet needs repairs, and the Admiral's watching.

- **2-6 players**, 12 rounds
- **Semi-cooperative:** shared Shipyard Integrity must stay above zero, but only the top scorer gets promoted to Dock Master
- **Labor Dice** count down each round — when they hit zero, jobs complete
- **Condition Found Reports** — 85% chance you're clear, 15% chance you just found more work
- Play locally vs AI bots or online with friends via room codes

## Quick Start

```bash
# Install
npm install

# Play locally (vs bots)
npm run dev
# Open http://localhost:3000

# Run tests
npm test                          # 63 unit tests
npx playwright test               # E2E (10 complete games)

# Online multiplayer (needs two terminals)
npm run server                    # Game server on port 8001
npm run dev                       # Frontend on port 3000
```

## Tech Stack

- **Next.js 16** (App Router, webpack) + **React 19** + **TypeScript**
- **Boardgame.io** (game engine, state machine, multiplayer)
- **Tailwind CSS 4** + **Framer Motion** (animations)
- **Vitest** (unit tests) + **Playwright** (E2E)
- **Remotion** (programmatic promo videos)
- **Gemini MCP** (adversarial auditor, voice synthesis, image generation)

## Features

- 5 AI bot strategies (balanced, aggressive, cautious, rush, hoarder)
- 30 work orders, 16 events, 6 foremen, 6 contracts, 5 mandates
- Mobile responsive with bottom navigation
- Guided tutorial with "The Foreman" narrator
- Post-game stats with 6 superlative badges
- 10 procedural sound effects
- Balance tuned across 3,400+ simulated games (55% win rate)
- 10/10 Playwright E2E complete games pass

## Deployment

- **Frontend:** Vercel — https://pm-game-flame.vercel.app
- **Game Server:** Render (boardgame.io + SocketIO)

## Development Process

Built with a two-AI governance system:
- **Claude** (Opus 4.6) — architect, implements features
- **Gemini** (Pro) — adversarial auditor, reviews every phase

Every feature follows: Plan → Gemini audit → Execute → Gemini review → Ship.

## License

MIT
