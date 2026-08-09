"use client";

import { motion } from "framer-motion";
import { GAME_CONSTANTS, SI_THRESHOLDS } from "@/game/types";
import { getSIHex } from "@/lib/theme";

const MAX = GAME_CONSTANTS.MAX_SI;

/** point on the gauge circle; 180deg = left, 0deg = right (y-up) */
function polar(cx: number, cy: number, r: number, deg: number) {
  const a = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) };
}
/** SVG arc path from angle a0 to a1 (screen-clockwise) */
function arcPath(cx: number, cy: number, r: number, a0: number, a1: number) {
  const s = polar(cx, cy, r, a0);
  const e = polar(cx, cy, r, a1);
  const large = Math.abs(a0 - a1) > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

/**
 * Shipyard Integrity gauge — the analog amber device from the key art.
 * Semicircular dial, colored value arc, needle, threshold ticks, digital readout.
 */
export function SIGauge({ value, size = 128 }: { value: number; size?: number }) {
  const c = getSIHex(value);
  const w = size;
  const h = size * 0.66;
  const cx = w / 2;
  const cy = h - 6;
  const r = w * 0.4;
  const f = Math.max(0, Math.min(1, value / MAX));
  const endAngle = 180 - f * 180;
  const needle = polar(cx, cy, r - 4, endAngle);

  const ticks = [
    SI_THRESHOLDS.EMERGENCY_MEASURES,
    SI_THRESHOLDS.SUPPLY_CHAIN_SKEPTICISM,
    SI_THRESHOLDS.INCREASED_OVERSIGHT,
  ];

  return (
    <div className="flex items-center gap-2" data-tutorial="si-tracker">
      <div style={{ width: w, height: h }} className="relative">
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          {/* track */}
          <path
            d={arcPath(cx, cy, r, 180, 0)}
            fill="none"
            stroke="#1e2d4a"
            strokeWidth={7}
            strokeLinecap="round"
          />
          {/* value arc */}
          <motion.path
            d={arcPath(cx, cy, r, 180, endAngle)}
            fill="none"
            stroke={c.stroke}
            strokeWidth={7}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 4px ${c.glow})` }}
            initial={false}
            animate={{ d: arcPath(cx, cy, r, 180, endAngle) }}
            transition={{ type: "spring", stiffness: 90, damping: 15 }}
          />
          {/* threshold ticks */}
          {ticks.map((t) => {
            const ta = 180 - Math.min(1, t / MAX) * 180;
            const p1 = polar(cx, cy, r + 5, ta);
            const p2 = polar(cx, cy, r - 5, ta);
            return (
              <line
                key={t}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="#4a6fa5"
                strokeWidth={1.5}
              />
            );
          })}
          {/* needle */}
          <motion.line
            x1={cx}
            y1={cy}
            stroke={c.stroke}
            strokeWidth={2.5}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 3px ${c.glow})` }}
            initial={false}
            animate={{ x2: needle.x, y2: needle.y }}
            transition={{ type: "spring", stiffness: 90, damping: 15 }}
          />
          <circle cx={cx} cy={cy} r={4} fill="#8baad4" />
          {/* readout */}
          <text
            x={cx}
            y={cy - r * 0.42}
            textAnchor="middle"
            fontSize={size * 0.22}
            fontWeight={800}
            fill={c.stroke}
          >
            {value}
          </text>
        </svg>
      </div>
      <div className="leading-tight">
        <div className="stencil text-[10px] text-navy-200">Shipyard</div>
        <div className="stencil text-[10px] text-navy-200">Integrity</div>
        <div
          className="stencil mt-0.5 text-[10px]"
          style={{ color: c.stroke, textShadow: `0 0 6px ${c.glow}` }}
        >
          {c.label}
        </div>
      </div>
    </div>
  );
}
