/**
 * Drydock Masters — Multiplayer Game Server
 * Production: Render (persistent Node.js for WebSockets)
 * Dev: localhost:8001
 */

import { Server, Origins } from "boardgame.io/server";
import { DrydockMasters } from "./game";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const server = Server({
  games: [DrydockMasters],
  origins: [
    Origins.LOCALHOST,
    FRONTEND_URL,
    // Allow Vercel preview deployments
    /\.vercel\.app$/,
  ],
});

const PORT = Number(process.env.PORT) || 8001;

server.run(PORT, () => {
  console.log(`Drydock Masters server running on port ${PORT}`);
  console.log(`Accepting connections from: ${FRONTEND_URL}`);
});
