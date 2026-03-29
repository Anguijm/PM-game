"use client";

import { useState, useEffect, useRef } from "react";
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
import { TutorialProvider } from "@/hooks/useTutorial";
import { TutorialOverlay } from "@/components/ui/TutorialOverlay";
import { SoundProvider, useSoundFX } from "@/hooks/useSound";
import { useAchievements } from "@/hooks/useAchievements";
import { AchievementPopup } from "@/components/ui/AchievementPopup";
import { VolumeControl } from "@/components/ui/VolumeControl";
import { MobileNav, type MobileTab } from "@/components/ui/MobileNav";
import { MobileHandDrawer } from "@/components/ui/MobileHandDrawer";
import { MobileDiceBar } from "@/components/ui/MobileDiceBar";

interface GameBoardProps {
  G: DrydockMastersState;
  ctx: any;
  moves: Record<string, (...args: any[]) => void>;
  events: Record<string, (...args: any[]) => void>;
  isActive: boolean;
  playerID: string;
  isTutorial?: boolean;
}

export function GameBoard({
  G,
  ctx,
  moves,
  events,
  isActive,
  playerID,
  isTutorial,
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
    <SoundProvider>
      <TutorialProvider enabled={isTutorial ?? false}>
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
          {isTutorial && <TutorialOverlay />}
        </GameUIProvider>
      </TutorialProvider>
    </SoundProvider>
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
  const [mobileTab, setMobileTab] = useState<MobileTab>("board");
  const { playSound } = useSoundFX();
  const { newlyEarned, evaluate, dismissNewAchievements } = useAchievements();
  const achievementsEvaluated = useRef(false);

  // Sound triggers based on state changes
  const prevPhase = useRef(phase);
  const prevRound = useRef(G.round);
  const prevSI = useRef(G.shipyardIntegrity);
  const prevCompletedCount = useRef(player.completedWork.length);
  const lowSIPlayed = useRef(false);

  useEffect(() => {
    // Phase change sound
    if (phase !== prevPhase.current) {
      if (phase === "planning") playSound("whoosh"); // event revealed at planning start
      prevPhase.current = phase;
    }

    // Round change
    if (G.round !== prevRound.current) {
      playSound("tick");
      prevRound.current = G.round;
    }

    // Job completed
    if (player.completedWork.length > prevCompletedCount.current) {
      playSound("stamp");
      prevCompletedCount.current = player.completedWork.length;
    }

    // SI alarm (once per threshold crossing)
    if (G.shipyardIntegrity < 10 && prevSI.current >= 10 && !lowSIPlayed.current) {
      playSound("alarm");
      lowSIPlayed.current = true;
    }
    if (G.shipyardIntegrity >= 10) lowSIPlayed.current = false;
    prevSI.current = G.shipyardIntegrity;

    // Game over
    if (ctx.gameover) {
      if (ctx.gameover.allLose) playSound("defeat");
      else playSound("fanfare");

      // Evaluate achievements once
      if (!achievementsEvaluated.current) {
        achievementsEvaluated.current = true;
        evaluate(G, ctx.gameover, playerID);
      }
    }
  }, [G.round, G.shipyardIntegrity, phase, player.completedWork.length, ctx.gameover, playSound, G, evaluate, playerID]);

  // Mobile: show/hide sections based on tab. Desktop: show all.
  const showBoard = mobileTab === "board";
  const showMarket = mobileTab === "market";
  const showInfo = mobileTab === "info";

  return (
    <div className="flex-1 p-3 space-y-3 sm:p-4 sm:space-y-4 pb-16 sm:pb-4">
      {/* Top Bar — always visible */}
      <TopBar
        round={G.round}
        phase={phase}
        shipyardIntegrity={G.shipyardIntegrity}
        currentPlayerLabel={`Player ${parseInt(ctx.currentPlayer) + 1}`}
        isActive={isActive}
        admiralMandate={G.admiralMandate}
        persistentProblems={G.persistentProblems}
      />

      {/* Mobile: persistent dice/resource bar */}
      <MobileDiceBar player={player} />

      {/* Action mode indicator */}
      {phase === "action" && isActive && <ActionModeBar />}

      {/* Phase-specific panel — always visible */}
      <PhasePanel
        G={G}
        phase={phase}
        playerID={playerID}
        isActive={isActive}
        moves={moves}
      />

      {/* === BOARD TAB (mobile) / always visible (desktop) === */}
      <div className={showBoard ? "" : "hidden sm:block"}>
        <PlayerBoard
          player={player}
          diceMap={diceMap}
          isActive={isActive && phase === "action"}
          moves={moves}
        />
      </div>

      {/* === INFO TAB (mobile) / always visible (desktop) === */}
      <div className={showInfo ? "" : "hidden sm:block"}>
        <MilestoneTracker
          player={player}
          round={G.round}
          numPlayers={Object.keys(G.players).length}
          admiralMandate={G.admiralMandate}
        />
        <div className="mt-3">
          <OpponentSummary
            players={G.players}
            currentPlayerID={playerID}
          />
        </div>
      </div>

      {/* Hand — desktop: normal panel. Mobile: collapsible drawer */}
      <div className="hidden sm:block">
        <HandPanel
          hand={player.hand}
          isActive={isActive && phase === "action"}
        />
      </div>
      <MobileHandDrawer
        hand={player.hand}
        isActive={isActive && phase === "action"}
      />

      {/* === MARKET TAB (mobile) / always visible (desktop) === */}
      <div className={showMarket ? "" : "hidden sm:block"}>
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
      </div>

      {/* Toast notifications */}
      <Toast />

      {/* Mobile bottom nav */}
      <MobileNav activeTab={mobileTab} onTabChange={setMobileTab} />

      {/* Achievement popup */}
      <AchievementPopup achievements={newlyEarned} onDismiss={dismissNewAchievements} />

      {/* Game Over */}
      {ctx.gameover && (
        <GameOver gameover={ctx.gameover} players={G.players} round={G.round} shipyardIntegrity={G.shipyardIntegrity} />
      )}
    </div>
  );
}
