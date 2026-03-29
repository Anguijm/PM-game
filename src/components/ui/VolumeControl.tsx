"use client";

import { useSoundFX } from "@/hooks/useSound";

export function VolumeControl() {
  const { volume, setVolume, muted, toggleMute } = useSoundFX();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleMute}
        className="text-xs text-navy-400 hover:text-steel-100 transition-colors"
        title={muted ? "Unmute" : "Mute"}
      >
        {muted ? "🔇" : volume > 0.5 ? "🔊" : "🔉"}
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.1}
        value={muted ? 0 : volume}
        onChange={(e) => setVolume(parseFloat(e.target.value))}
        className="w-16 h-1 accent-amber-500"
      />
    </div>
  );
}
