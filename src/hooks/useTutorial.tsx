"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";

export interface TutorialStep {
  id: string;
  /** CSS selector of element to highlight (null = no highlight, show message only) */
  highlight: string | null;
  /** Speaker text — from "The Foreman" */
  text: string;
  /** The move name the player must make to advance (null = click "Next" to advance) */
  requiredMove: string | null;
  /** Phase this step occurs in */
  phase: string;
  /** Round this step occurs in */
  round: number;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  // === ROUND 1: The Basics ===
  {
    id: "welcome",
    highlight: null,
    text: "Welcome to the Regional Maintenance Center, rookie. I'm your Foreman. We've got ships waiting and the Admiral breathing down our necks. Let me show you how things work around here.",
    requiredMove: null,
    phase: "contractSelection",
    round: 1,
  },
  {
    id: "select-contract",
    highlight: "[data-tutorial='contract-choices']",
    text: "First, pick your Ship Contract. Side A is standard — good for learning. Side B is for veterans. Choose one to get started.",
    requiredMove: "selectContract",
    phase: "contractSelection",
    round: 1,
  },
  {
    id: "event-explain",
    highlight: "[data-tutorial='phase-panel']",
    text: "Every round starts with an Event. Could be good news, could be bad. Read it and acknowledge — you can't dodge what the Navy throws at you.",
    requiredMove: "acknowledgeEvent",
    phase: "event",
    round: 1,
  },
  {
    id: "draft-explain",
    highlight: "[data-tutorial='phase-panel']",
    text: "Now we draft. The Work Order Market shows available jobs. Pick the one with the highest Prestige Points — that's how you get promoted.",
    requiredMove: "draftCard",
    phase: "planning",
    round: 1,
  },
  {
    id: "stage-explain",
    highlight: "[data-tutorial='hand-panel']",
    text: "Good pick. Now look at your hand — these are your Available Work Packages. Click a card to select it, then click an empty drydock slot to stage it. Staging costs Material.",
    requiredMove: "stageWork",
    phase: "action",
    round: 1,
  },
  {
    id: "assign-explain",
    highlight: "[data-tutorial='dice-pool']",
    text: "Now the real work begins. Click one of your colored dice, then click the matching requirement slot on a staged card. The die becomes a countdown timer — when it hits 0, the job is done. Wages cost $1 per die.",
    requiredMove: "assignLabor",
    phase: "action",
    round: 1,
  },
  {
    id: "pass-explain",
    highlight: "[data-tutorial='action-buttons']",
    text: "You've got 2 actions per round. Use your second action however you like — assign another die, procure resources, or just pass. When you're done, hit Pass Turn.",
    requiredMove: null, // any action or pass
    phase: "action",
    round: 1,
  },
  {
    id: "resolution-explain",
    highlight: "[data-tutorial='phase-panel']",
    text: "Resolution time. Watch your dice count down by 1. When a die hits 0, that job is inspected. If it passes, you earn Prestige Points. If Growth Work is found... well, you'll see.",
    requiredMove: "acknowledgeResolution",
    phase: "resolution",
    round: 1,
  },

  // === ROUND 2: Economy & Completion ===
  {
    id: "round2-event",
    highlight: null,
    text: "Round 2. The shipyard never sleeps. Let's see what the Navy throws at us this time.",
    requiredMove: "acknowledgeEvent",
    phase: "event",
    round: 2,
  },
  {
    id: "round2-draft",
    highlight: "[data-tutorial='phase-panel']",
    text: "Draft another job. Look at the material cost — if you can't afford it, pick something cheaper. Being broke at the wrong time is how ships don't get built.",
    requiredMove: "draftCard",
    phase: "planning",
    round: 2,
  },
  {
    id: "procurement-explain",
    highlight: "[data-tutorial='action-buttons']",
    text: "Running low on resources? Use Procurement to get $3 Funding or 2 Material. It costs an action, but you can't stage work without materials.",
    requiredMove: null,
    phase: "action",
    round: 2,
  },
  {
    id: "round2-resolution",
    highlight: "[data-tutorial='phase-panel']",
    text: "More dice counting down. Any jobs hitting zero get inspected through the CFR bag — 85% chance it's clear, 15% chance of Growth Work complications. Fingers crossed.",
    requiredMove: "acknowledgeResolution",
    phase: "resolution",
    round: 2,
  },

  // === ROUND 3: The Aha! Moment ===
  {
    id: "si-warning",
    highlight: "[data-tutorial='si-tracker']",
    text: "ALERT! See that Shipyard Integrity gauge? It's been dropping. Persistent Problems drain SI every round. If it hits zero, EVERYONE LOSES — including you. This is where it gets real.",
    requiredMove: "acknowledgeEvent",
    phase: "event",
    round: 3,
  },
  {
    id: "tension-moment",
    highlight: "[data-tutorial='action-buttons']",
    text: "Here's the dilemma, rookie. You could chase that high-PP job for yourself... or you could clear the Persistent Problem to save the shipyard. Your opponent just chose to be greedy. What do you do? This is what separates a good Superintendent from a dead one.",
    requiredMove: null,
    phase: "action",
    round: 3,
  },
  {
    id: "round3-resolution",
    highlight: null,
    text: "Smart choice. Remember: there's no point winning the PP race if the whole yard goes under. Balance ambition with duty — that's the game.",
    requiredMove: "acknowledgeResolution",
    phase: "resolution",
    round: 3,
  },

  // === ROUND 4: Free Play ===
  {
    id: "freeplay",
    highlight: null,
    text: "You've got the basics, rookie. This last round is yours — no hand-holding. Complete a job, hit the milestone, and show me what you've learned. Good luck.",
    requiredMove: "acknowledgeEvent",
    phase: "event",
    round: 4,
  },
  {
    id: "tutorial-complete",
    highlight: null,
    text: "Outstanding work, Superintendent. You're ready for the real drydock. Remember: the fleet won't wait, and neither will the Admiral. Dismissed!",
    requiredMove: null,
    phase: "resolution",
    round: 4,
  },
];

// ============================================================
// Tutorial Context
// ============================================================

interface TutorialState {
  active: boolean;
  currentStepIndex: number;
  currentStep: TutorialStep | null;
  totalSteps: number;
  advance: () => void;
  advanceIfMove: (moveName: string) => void;
  isStepForPhase: (phase: string, round: number) => boolean;
  skipTutorial: () => void;
}

const TutorialContext = createContext<TutorialState | null>(null);

export function TutorialProvider({
  children,
  enabled,
}: {
  children: ReactNode;
  enabled: boolean;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [skipped, setSkipped] = useState(false);

  const currentStep = enabled && !skipped && stepIndex < TUTORIAL_STEPS.length
    ? TUTORIAL_STEPS[stepIndex]
    : null;

  const skipTutorial = useCallback(() => {
    setSkipped(true);
  }, []);

  const advance = useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, TUTORIAL_STEPS.length));
  }, []);

  const advanceIfMove = useCallback(
    (moveName: string) => {
      if (!currentStep) return;
      if (currentStep.requiredMove === moveName || currentStep.requiredMove === null) {
        advance();
      }
    },
    [currentStep, advance]
  );

  const isStepForPhase = useCallback(
    (phase: string, round: number) => {
      if (!currentStep) return false;
      return currentStep.phase === phase && currentStep.round === round;
    },
    [currentStep]
  );

  const value = useMemo(
    () => ({
      active: enabled && !skipped && stepIndex < TUTORIAL_STEPS.length,
      currentStepIndex: stepIndex,
      currentStep,
      totalSteps: TUTORIAL_STEPS.length,
      advance,
      advanceIfMove,
      isStepForPhase,
      skipTutorial,
    }),
    [enabled, skipped, stepIndex, currentStep, advance, advanceIfMove, isStepForPhase, skipTutorial]
  );

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial(): TutorialState {
  const ctx = useContext(TutorialContext);
  if (!ctx) {
    return {
      active: false,
      currentStepIndex: 0,
      currentStep: null,
      totalSteps: 0,
      advance: () => {},
      advanceIfMove: () => {},
      isStepForPhase: () => false,
      skipTutorial: () => {},
    };
  }
  return ctx;
}
