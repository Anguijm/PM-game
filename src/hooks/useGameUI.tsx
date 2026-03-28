"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useMemo,
  type ReactNode,
} from "react";

export type ActionMode =
  | { type: "idle" }
  | { type: "stagingWork"; cardID: string }
  | { type: "assigningLabor"; dieID: string }
  | { type: "coordinatingLabor"; dieID: string };

interface GameUIState {
  actionMode: ActionMode;
  toast: string | null;
  startStagingWork: (cardID: string) => void;
  startAssigningLabor: (dieID: string) => void;
  startCoordinatingLabor: (dieID: string) => void;
  cancelAction: () => void;
  showToast: (message: string) => void;
  clearToast: () => void;
}

const GameUIContext = createContext<GameUIState | null>(null);

export function GameUIProvider({ children }: { children: ReactNode }) {
  const [actionMode, setActionMode] = useState<ActionMode>({ type: "idle" });
  const [toast, setToast] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startStagingWork = useCallback((cardID: string) => {
    setActionMode({ type: "stagingWork", cardID });
  }, []);

  const startAssigningLabor = useCallback((dieID: string) => {
    setActionMode({ type: "assigningLabor", dieID });
  }, []);

  const startCoordinatingLabor = useCallback((dieID: string) => {
    setActionMode({ type: "coordinatingLabor", dieID });
  }, []);

  const cancelAction = useCallback(() => {
    setActionMode({ type: "idle" });
  }, []);

  const showToast = useCallback((message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast(message);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const clearToast = useCallback(() => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast(null);
  }, []);

  const contextValue = useMemo(
    () => ({
      actionMode,
      toast,
      startStagingWork,
      startAssigningLabor,
      startCoordinatingLabor,
      cancelAction,
      showToast,
      clearToast,
    }),
    [
      actionMode,
      toast,
      startStagingWork,
      startAssigningLabor,
      startCoordinatingLabor,
      cancelAction,
      showToast,
      clearToast,
    ]
  );

  return (
    <GameUIContext.Provider value={contextValue}>
      {children}
    </GameUIContext.Provider>
  );
}

export function useGameUI(): GameUIState {
  const ctx = useContext(GameUIContext);
  if (!ctx) {
    throw new Error("useGameUI must be used within a GameUIProvider");
  }
  return ctx;
}
