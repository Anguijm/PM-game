"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { DrydockMastersState } from "@/game/types";
import { ContractSelectionView } from "./ContractSelectionView";
import { EventPhaseView } from "./EventPhaseView";
import { PlanningPhaseView } from "./PlanningPhaseView";
import { ActionPhaseView } from "./ActionPhaseView";
import { ResolutionPhaseView } from "./ResolutionPhaseView";

interface PhasePanelProps {
  G: DrydockMastersState;
  phase: string;
  playerID: string;
  isActive: boolean;
  moves: Record<string, (...args: any[]) => void>;
}

export function PhasePanel({
  G,
  phase,
  playerID,
  isActive,
  moves,
}: PhasePanelProps) {
  const content = getPhaseContent(G, phase, playerID, isActive, moves);
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={phase}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
      >
        {content}
      </motion.div>
    </AnimatePresence>
  );
}

function getPhaseContent(
  G: DrydockMastersState,
  phase: string,
  playerID: string,
  isActive: boolean,
  moves: Record<string, (...args: any[]) => void>
) {
  switch (phase) {
    case "contractSelection":
      return (
        <ContractSelectionView
          player={G.players[playerID]}
          isActive={isActive}
          onSelect={(contractID) => moves.selectContract?.(contractID)}
        />
      );

    case "event":
      return (
        <EventPhaseView
          event={G.activeEvent}
          isActive={isActive}
          onAcknowledge={() => moves.acknowledgeEvent?.()}
        />
      );

    case "planning":
      return (
        <PlanningPhaseView
          market={G.workOrderMarket}
          isActive={isActive}
          onDraftCard={(i) => moves.draftCard?.(i)}
        />
      );

    case "action":
      return (
        <ActionPhaseView
          G={G}
          playerID={playerID}
          isActive={isActive}
          moves={moves}
        />
      );

    case "resolution":
      return (
        <ResolutionPhaseView
          G={G}
          isActive={isActive}
          onAcknowledge={() => moves.acknowledgeResolution?.()}
        />
      );

    default:
      return null;
  }
}
