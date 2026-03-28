"use client";

import { useEffect, useRef, useState } from "react";
import { Client } from "boardgame.io/client";
import { SocketIO } from "boardgame.io/multiplayer";
import { DrydockMasters } from "@/game";
import { GameBoard } from "@/components/board/GameBoard";
import type { DrydockMastersState } from "@/game/types";
import { getServerURL } from "@/lib/lobby";

interface OnlineClientProps {
  matchID: string;
  playerID: string;
  credentials: string;
}

interface ClientState {
  G: DrydockMastersState | null;
  ctx: any;
  isActive: boolean;
}

export default function OnlineClient({
  matchID,
  playerID,
  credentials,
}: OnlineClientProps) {
  const [state, setState] = useState<ClientState>({
    G: null,
    ctx: null,
    isActive: false,
  });
  const clientRef = useRef<any>(null);

  useEffect(() => {
    const server = getServerURL();

    const client = Client({
      game: DrydockMasters,
      multiplayer: SocketIO({ server }),
      matchID,
      playerID,
      credentials,
    });

    client.subscribe((s: any) => {
      if (s) {
        setState({
          G: s.G,
          ctx: s.ctx,
          isActive: s.isActive,
        });
      }
    });

    client.start();
    clientRef.current = client;

    return () => {
      client.stop();
      clientRef.current = null;
    };
  }, [matchID, playerID, credentials]);

  const activeClient = clientRef.current;

  if (!state.G || !state.ctx || !activeClient) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-navy-400 text-lg">Connecting to shipyard...</p>
          <p className="text-navy-600 text-sm">
            Match: {matchID} | You are Player {parseInt(playerID) + 1}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Online status bar */}
      <div className="flex items-center justify-between border-b border-navy-600 bg-navy-900 px-4 py-2">
        <span className="text-xs text-navy-400">
          Online — Player {parseInt(playerID) + 1}
        </span>
        <span className="text-xs text-success">Connected</span>
      </div>

      <GameBoard
        G={state.G}
        ctx={state.ctx}
        moves={activeClient.moves}
        events={activeClient.events}
        isActive={state.isActive}
        playerID={playerID}
      />
    </div>
  );
}
