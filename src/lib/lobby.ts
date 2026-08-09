/**
 * Lobby utilities for creating/joining online matches.
 */

const GAME_NAME = "drydock-masters";

/** Max age (ms) for a match to appear in the lobby browser */
const STALE_MATCH_MS = 15 * 60 * 1000; // 15 minutes

export interface LobbyMatch {
  matchID: string;
  roomCode: string;
  players: string[]; // names of joined players
  seatsOpen: number;
  maxPlayers: number;
  createdAt: number; // epoch ms
}

export function getServerURL(): string {
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_GAME_SERVER) {
    return process.env.NEXT_PUBLIC_GAME_SERVER;
  }
  return "http://localhost:8001";
}

/** Generate a 6-character room code */
export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I, O, 0, 1 to avoid confusion
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/** Create a new match on the server */
export async function createMatch(
  numPlayers: number,
  isPublic: boolean = true
): Promise<{ matchID: string; roomCode: string }> {
  const server = getServerURL();
  const roomCode = generateRoomCode();

  const res = await fetch(`${server}/games/${GAME_NAME}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      numPlayers,
      setupData: { roomCode, isPublic, createdAt: Date.now() },
    }),
  });

  if (!res.ok) throw new Error(`Failed to create match: ${res.statusText}`);
  const data = await res.json();

  return { matchID: data.matchID, roomCode };
}

/** List open public matches available to join */
export async function listOpenMatches(): Promise<LobbyMatch[]> {
  const server = getServerURL();

  const res = await fetch(`${server}/games/${GAME_NAME}?isGameover=false`);
  if (!res.ok) return [];

  const data = await res.json();
  const matches = data.matches || [];
  const now = Date.now();

  return matches
    .filter((m: any) => {
      // Must be public
      if (m.setupData?.isPublic === false) return false;
      // Must have open seats
      const filledSeats = (m.players || []).filter((p: any) => p.name).length;
      if (filledSeats >= (m.players?.length || 0)) return false;
      // Filter stale matches (>15 min old or no timestamp)
      const createdAt = m.setupData?.createdAt || m.createdAt;
      if (!createdAt || now - createdAt > STALE_MATCH_MS) return false;
      return true;
    })
    .map((m: any) => {
      const playerNames = (m.players || [])
        .filter((p: any) => p.name)
        .map((p: any) => p.name);
      return {
        matchID: m.matchID,
        roomCode: m.setupData?.roomCode || "???",
        players: playerNames,
        seatsOpen: (m.players?.length || 0) - playerNames.length,
        maxPlayers: m.players?.length || 0,
        createdAt: m.setupData?.createdAt || 0,
      };
    })
    .sort((a: LobbyMatch, b: LobbyMatch) => b.createdAt - a.createdAt);
}

/** List available matches to find one by room code */
export async function findMatch(
  roomCode: string
): Promise<string | null> {
  const server = getServerURL();

  const res = await fetch(`${server}/games/${GAME_NAME}`);
  if (!res.ok) return null;

  const data = await res.json();
  const matches = data.matches || [];

  for (const match of matches) {
    if (match.setupData?.roomCode === roomCode) {
      return match.matchID;
    }
  }
  return null;
}

/** Join an existing match */
export async function joinMatch(
  matchID: string,
  playerName: string
): Promise<{ playerID: string; credentials: string }> {
  const server = getServerURL();

  // Find first available seat
  const matchRes = await fetch(`${server}/games/${GAME_NAME}/${matchID}`);
  if (!matchRes.ok) throw new Error("Match not found");
  const matchData = await matchRes.json();

  const openSeat = matchData.players.find(
    (p: any) => !p.name
  );
  if (!openSeat) throw new Error("No open seats");

  const joinRes = await fetch(
    `${server}/games/${GAME_NAME}/${matchID}/join`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerID: String(openSeat.id),
        playerName,
      }),
    }
  );

  if (!joinRes.ok) throw new Error(`Failed to join: ${joinRes.statusText}`);
  const joinData = await joinRes.json();

  return {
    playerID: String(openSeat.id),
    credentials: joinData.playerCredentials,
  };
}
