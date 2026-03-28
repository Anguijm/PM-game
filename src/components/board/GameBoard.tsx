"use client";

import type { DrydockMastersState } from "@/game/types";
import { GAME_CONSTANTS } from "@/game/types";
import { TopBar } from "./TopBar";
import { PlayerBoard } from "@/components/player/PlayerBoard";
import { HandPanel } from "@/components/player/HandPanel";
import { MarketPanel } from "@/components/market/MarketPanel";
import { PhasePanel } from "@/components/phases/PhasePanel";
import { ActionModeBar } from "@/components/ui/ActionModeBar";
import { Toast } from "@/components/ui/Toast";
import { GameOver } from "./GameOver";
import { OpponentSummary } from "@/components/player/OpponentSummary";
import { MilestoneTracker } from "@/components/player/MilestoneTracker";
import { GameUIProvider } from "@/hooks/useGameUI";
import { useDiceMap } from "@/hooks/useDiceMap";

interface GameBoardProps {
  G: DrydockMastersState;
  ctx: any;
  moves: Record<string, (...args: any[]) => void>;
  events: Record<string, (...args: any[]) => void>;
  isActive: boolean;
  playerID: string;
}

export function GameBoard({
  G,
  ctx,
  moves,
  events,
  isActive,
  playerID,
}: GameBoardProps) {
  const player = G?.players?.[playerID];
  const phase = ctx?.phase || "event";

  if (!player) {
    return (
      <div className="p-8 text-alert-red">
        Error: Player {playerID} data not available.
      </div>
    );
  }

  return (
    <GameUIProvider>
      <GameBoardInner
        G={G}
        ctx={ctx}
        moves={moves}
        events={events}
        isActive={isActive}
        playerID={playerID}
        phase={phase}
      />
    </GameUIProvider>
  );
}

/** Inner component that can use GameUIContext */
function GameBoardInner({
  G,
  ctx,
  moves,
  events,
  isActive,
  playerID,
  phase,
}: GameBoardProps & { phase: string }) {
  const diceMap = useDiceMap(G.players);
  const player = G.players[playerID];

  return (
    <div className="flex-1 p-3 space-y-3 sm:p-4 sm:space-y-4">
      {/* Top Bar */}
      <TopBar
        round={G.round}
        phase={phase}
        shipyardIntegrity={G.shipyardIntegrity}
        currentPlayerLabel={`Player ${parseInt(ctx.currentPlayer) + 1}`}
        isActive={isActive}
        admiralMandate={G.admiralMandate}
        persistentProblems={G.persistentProblems}
      />

      {/* Action mode indicator */}
      {phase === "action" && isActive && <ActionModeBar />}

      {/* Phase-specific panel */}
      <PhasePanel
        G={G}
        phase={phase}
        playerID={playerID}
        isActive={isActive}
        moves={moves}
      />

      {/* Player Board (slots + resources + dice) */}
      <PlayerBoard
        player={player}
        diceMap={diceMap}
        isActive={isActive && phase === "action"}
        moves={moves}
      />

      {/* Milestone Progress */}
      <MilestoneTracker
        player={player}
        round={G.round}
        numPlayers={Object.keys(G.players).length}
        admiralMandate={G.admiralMandate}
      />

      {/* Hand (AWP) */}
      <HandPanel
        hand={player.hand}
        isActive={isActive && phase === "action"}
      />

      {/* Opponents */}
      <OpponentSummary
        players={G.players}
        currentPlayerID={playerID}
      />

      {/* Markets */}
      <MarketPanel
        workOrderMarket={G.workOrderMarket}
        foremanMarket={G.foremanMarket}
        isActive={isActive}
        phase={phase}
        onDraftCard={(i) => moves.draftCard?.(i)}
        onHireForeman={(i) => moves.hireForeman?.(i)}
        canAffordForeman={
          player.funding >= GAME_CONSTANTS.FOREMAN_COST &&
          player.foreman === null
        }
      />

      {/* Toast notifications */}
      <Toast />

      {/* Game Over */}
      {ctx.gameover && (
        <GameOver gameover={ctx.gameover} players={G.players} />
      )}
    </div>
  );
}
