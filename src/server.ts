/**
 * Drydock Masters — Multiplayer Game Server
 * Runs on port 8001 alongside Next.js on port 3000.
 * Uses boardgame.io server with socket.io transport.
 */

import { Server, Origins } from "boardgame.io/server";
import { DrydockMasters } from "./game";

const server = Server({
  games: [DrydockMasters],
  origins: [
    Origins.LOCALHOST,
    "http://localhost:3000",
    "http://localhost:3001",
  ],
});

const PORT = Number(process.env.GAME_SERVER_PORT) || 8001;

server.run(PORT, () => {
  console.log(`Drydock Masters server running on port ${PORT}`);
});
