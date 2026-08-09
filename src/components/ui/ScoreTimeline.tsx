"use client";

import type { DrydockMastersState } from "@/game/types";

const PLAYER_COLORS = [
  "#f59e0b", // amber
  "#3b82f6", // blue
  "#ef4444", // red
  "#22c55e", // green
  "#a855f7", // purple
  "#ec4899", // pink
];

const SI_COLOR = "#64748b"; // slate

interface ScoreTimelineProps {
  players: DrydockMastersState["players"];
  shipyardIntegrity: number;
}

export function ScoreTimeline({ players, shipyardIntegrity }: ScoreTimelineProps) {
  const playerList = Object.values(players);
  if (playerList.length === 0 || playerList[0].history.length === 0) return null;

  const numRounds = playerList[0].history.length;

  // Find max PP across all players for Y-axis scaling
  const allPP = playerList.flatMap((p) => p.history.map((h) => h.pp));
  const maxPP = Math.max(...allPP, 1);

  // Chart dimensions
  const W = 400;
  const H = 160;
  const PAD_L = 30;
  const PAD_R = 10;
  const PAD_T = 10;
  const PAD_B = 20;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  function xScale(round: number) {
    return PAD_L + (round / Math.max(numRounds - 1, 1)) * plotW;
  }

  function yScale(value: number, max: number) {
    return PAD_T + plotH - (value / Math.max(max, 1)) * plotH;
  }

  function buildPath(data: number[], max: number): string {
    return data
      .map((v, i) => `${i === 0 ? "M" : "L"}${xScale(i).toFixed(1)},${yScale(v, max).toFixed(1)}`)
      .join(" ");
  }

  // SI uses its own scale (typically 0-35)
  const maxSI = Math.max(...playerList[0].history.map((h) => h.si), 35);

  return (
    <div className="space-y-1">
      <h3 className="text-xs text-navy-400 uppercase tracking-wider">Score Timeline</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
          const y = PAD_T + plotH * (1 - frac);
          return (
            <g key={frac}>
              <line
                x1={PAD_L} y1={y} x2={W - PAD_R} y2={y}
                stroke="#1e293b" strokeWidth={0.5}
              />
              <text x={PAD_L - 4} y={y + 3} textAnchor="end" fill="#475569" fontSize={7}>
                {Math.round(maxPP * frac)}
              </text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {Array.from({ length: numRounds }, (_, i) => (
          <text
            key={i}
            x={xScale(i)}
            y={H - 4}
            textAnchor="middle"
            fill="#475569"
            fontSize={7}
          >
            {i + 1}
          </text>
        ))}

        {/* SI line (dashed, background) */}
        <path
          d={buildPath(playerList[0].history.map((h) => h.si), maxSI)}
          fill="none"
          stroke={SI_COLOR}
          strokeWidth={1}
          strokeDasharray="3,2"
          opacity={0.4}
        />

        {/* Player PP lines */}
        {playerList.map((player, idx) => (
          <path
            key={player.id}
            d={buildPath(player.history.map((h) => h.pp), maxPP)}
            fill="none"
            stroke={PLAYER_COLORS[idx % PLAYER_COLORS.length]}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* End-point dots */}
        {playerList.map((player, idx) => {
          const lastPP = player.history[player.history.length - 1]?.pp || 0;
          return (
            <circle
              key={player.id}
              cx={xScale(numRounds - 1)}
              cy={yScale(lastPP, maxPP)}
              r={3}
              fill={PLAYER_COLORS[idx % PLAYER_COLORS.length]}
            />
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 justify-center">
        {playerList.map((player, idx) => (
          <div key={player.id} className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: PLAYER_COLORS[idx % PLAYER_COLORS.length] }}
            />
            <span className="text-[10px] text-navy-400">{player.name}</span>
          </div>
        ))}
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-slate-500 opacity-40" />
          <span className="text-[10px] text-navy-400">SI</span>
        </div>
      </div>
    </div>
  );
}
