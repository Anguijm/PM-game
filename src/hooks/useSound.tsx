"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

type SoundName =
  | "click"
  | "clunk"
  | "tick"
  | "chime"
  | "buzz"
  | "alarm"
  | "whoosh"
  | "stamp"
  | "fanfare"
  | "defeat";

interface SoundState {
  playSound: (name: SoundName) => void;
  volume: number;
  setVolume: (v: number) => void;
  muted: boolean;
  toggleMute: () => void;
}

const SoundContext = createContext<SoundState | null>(null);

const SOUND_PATHS: Record<SoundName, string> = {
  click: "/audio/sfx/click.wav",
  clunk: "/audio/sfx/clunk.wav",
  tick: "/audio/sfx/tick.wav",
  chime: "/audio/sfx/chime.wav",
  buzz: "/audio/sfx/buzz.wav",
  alarm: "/audio/sfx/alarm.wav",
  whoosh: "/audio/sfx/whoosh.wav",
  stamp: "/audio/sfx/stamp.wav",
  fanfare: "/audio/sfx/fanfare.wav",
  defeat: "/audio/sfx/defeat.wav",
};

export function SoundProvider({ children }: { children: ReactNode }) {
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const audioCache = useRef<Record<string, HTMLAudioElement>>({});

  const playSound = useCallback(
    (name: SoundName) => {
      if (muted || typeof window === "undefined") return;

      try {
        // Reuse cached audio elements for performance
        if (!audioCache.current[name]) {
          audioCache.current[name] = new Audio(SOUND_PATHS[name]);
        }
        const audio = audioCache.current[name];
        audio.volume = volume;
        audio.currentTime = 0;
        audio.play().catch(() => {
          // Audio blocked by browser — user hasn't interacted yet
        });
      } catch {
        // Graceful degradation — sounds are optional
      }
    },
    [volume, muted]
  );

  const toggleMute = useCallback(() => setMuted((m) => !m), []);

  const value = useMemo(
    () => ({ playSound, volume, setVolume, muted, toggleMute }),
    [playSound, volume, muted, toggleMute]
  );

  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  );
}

export function useSoundFX(): SoundState {
  const ctx = useContext(SoundContext);
  if (!ctx) {
    return {
      playSound: () => {},
      volume: 0.5,
      setVolume: () => {},
      muted: false,
      toggleMute: () => {},
    };
  }
  return ctx;
}
