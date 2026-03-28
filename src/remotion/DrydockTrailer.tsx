import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
  staticFile,
} from "remotion";

// ============================================================
// Styles (inline since we can't use Tailwind in Remotion easily)
// ============================================================

const NAVY_950 = "#0a0e1a";
const NAVY_900 = "#0f1729";
const NAVY_800 = "#162038";
const NAVY_700 = "#1e2d4a";
const NAVY_600 = "#2a3f66";
const STEEL_100 = "#dce4ec";
const STEEL_300 = "#a8b8c8";
const AMBER_400 = "#fbbf24";
const AMBER_500 = "#f59e0b";
const ALERT_RED = "#ef4444";
const SUCCESS = "#22c55e";
const PRESTIGE = "#a78bfa";
const DIE_RED = "#dc2626";
const DIE_BLUE = "#2563eb";
const DIE_YELLOW = "#eab308";
const DIE_GREEN = "#16a34a";
const DIE_GRAY = "#6b7280";

const DIE_COLORS = [DIE_RED, DIE_BLUE, DIE_YELLOW, DIE_GREEN, DIE_GRAY];
const DIE_LABELS = ["H", "E", "L", "C", "W"];

export const DrydockTrailer: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: NAVY_950 }}>
      {/* Scene 1: Title Card (0-4s) */}
      <Sequence from={0} durationInFrames={4 * fps}>
        <TitleCard />
      </Sequence>

      {/* Scene 2: Game Board Overview (4-8s) */}
      <Sequence from={4 * fps} durationInFrames={4 * fps}>
        <GameBoardScene />
      </Sequence>

      {/* Scene 3: Dice Assignment (8-12s) */}
      <Sequence from={8 * fps} durationInFrames={4 * fps}>
        <DiceScene />
      </Sequence>

      {/* Scene 4: SI Crisis (12-16s) */}
      <Sequence from={12 * fps} durationInFrames={4 * fps}>
        <SICrisisScene />
      </Sequence>

      {/* Scene 5: CFR Bag Draw (16-19s) */}
      <Sequence from={16 * fps} durationInFrames={3 * fps}>
        <CFRDrawScene />
      </Sequence>

      {/* Scene 6: End Card (19-22s) */}
      <Sequence from={19 * fps} durationInFrames={3 * fps}>
        <EndCard />
      </Sequence>
    </AbsoluteFill>
  );
};

// ============================================================
// Scene 1: Title Card
// ============================================================

const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [0, 20], [40, 0], { extrapolateRight: "clamp" });
  const taglineOpacity = interpolate(frame, [30, 50], [0, 1], { extrapolateRight: "clamp" });
  const lineWidth = interpolate(frame, [20, 50], [0, 400], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        background: `radial-gradient(ellipse at center, ${NAVY_800} 0%, ${NAVY_950} 70%)`,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: STEEL_100,
            letterSpacing: "0.05em",
            fontFamily: "system-ui, sans-serif",
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            textShadow: `0 0 60px ${AMBER_500}40`,
          }}
        >
          DRYDOCK MASTERS
        </h1>
        <div
          style={{
            width: lineWidth,
            height: 3,
            backgroundColor: AMBER_500,
            margin: "20px auto",
            borderRadius: 2,
          }}
        />
        <p
          style={{
            fontSize: 28,
            color: AMBER_400,
            fontFamily: "system-ui, sans-serif",
            letterSpacing: "0.2em",
            opacity: taglineOpacity,
          }}
        >
          THE FLEET WON'T WAIT
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// Scene 2: Game Board Overview
// ============================================================

const GameBoardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: NAVY_950, opacity: fadeIn, padding: 60 }}>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 40,
          backgroundColor: NAVY_800,
          borderRadius: 12,
          padding: "16px 24px",
          border: `1px solid ${NAVY_600}`,
          marginBottom: 30,
        }}
      >
        <StatItem label="ROUND" value="4 / 12" color={STEEL_100} />
        <StatItem label="PHASE" value="ACTION" color={SUCCESS} />
        <SIBar frame={frame} value={24} />
        <StatItem label="TURN" value="Player 1" color={STEEL_100} />
        <div
          style={{
            marginLeft: "auto",
            backgroundColor: `${SUCCESS}30`,
            color: SUCCESS,
            padding: "4px 12px",
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          YOUR TURN
        </div>
      </div>

      {/* Work slots */}
      <div style={{ display: "flex", gap: 20, marginBottom: 30 }}>
        {["Hull Inspection", "Bilge Overhaul", "Radar Calibration", ""].map(
          (name, i) => (
            <WorkSlot key={i} name={name} frame={frame} index={i} />
          )
        )}
      </div>

      {/* Resources bar */}
      <div
        style={{
          display: "flex",
          gap: 30,
          backgroundColor: NAVY_800,
          borderRadius: 12,
          padding: "14px 24px",
          border: `1px solid ${NAVY_600}`,
          marginBottom: 20,
        }}
      >
        <StatItem label="Funding" value="$7" color={AMBER_400} />
        <StatItem label="Material" value="3" color={STEEL_300} />
        <StatItem label="Prestige" value="12" color={PRESTIGE} />
        <StatItem label="Actions" value="2" color={SUCCESS} />
      </div>

      {/* Dice pool */}
      <div
        style={{
          display: "flex",
          gap: 12,
          backgroundColor: NAVY_800,
          borderRadius: 12,
          padding: "14px 24px",
          border: `1px solid ${NAVY_600}`,
        }}
      >
        <span
          style={{ fontSize: 12, color: STEEL_300, alignSelf: "center", marginRight: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}
        >
          Available Labor
        </span>
        {DIE_COLORS.map((color, i) => {
          const delay = i * 8;
          const scale = interpolate(frame, [delay, delay + 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={i}
              style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                backgroundColor: color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: 700,
                color: color === DIE_YELLOW ? NAVY_950 : "white",
                transform: `scale(${scale})`,
              }}
            >
              {DIE_LABELS[i]}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// Scene 3: Dice Assignment Animation
// ============================================================

const DiceScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  // Dice countdown: 3 → 2 → 1 → 0
  const countdownValue = Math.max(0, 3 - Math.floor(frame / 25));
  const pulseScale =
    frame % 25 < 5 ? interpolate(frame % 25, [0, 5], [1.2, 1], { extrapolateRight: "clamp" }) : 1;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: NAVY_950,
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeIn,
      }}
    >
      <p
        style={{
          fontSize: 20,
          color: STEEL_300,
          marginBottom: 40,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
        }}
      >
        Labor dice count down each round
      </p>

      <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
        {/* The card */}
        <div
          style={{
            width: 280,
            backgroundColor: NAVY_800,
            borderRadius: 16,
            border: `1px solid ${NAVY_600}`,
            padding: 24,
          }}
        >
          <h3 style={{ fontSize: 20, fontWeight: 700, color: STEEL_100 }}>
            Main Engine Rebuild
          </h3>
          <div style={{ display: "flex", gap: 8, marginTop: 8, fontSize: 13, color: STEEL_300 }}>
            <span style={{ color: PRESTIGE }}>8 PP</span>
            <span>4M cost</span>
            <span style={{ color: AMBER_400 }}>HIGH PROFILE</span>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
            {/* Assigned die counting down */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                backgroundColor: DIE_BLUE,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: 700,
                color: "white",
                transform: `scale(${pulseScale})`,
                boxShadow: countdownValue === 0 ? `0 0 20px ${SUCCESS}80` : "none",
              }}
            >
              {countdownValue}
            </div>
            {/* Unfilled slots */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                border: `2px dashed ${DIE_RED}60`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                color: `${DIE_RED}80`,
              }}
            >
              3
            </div>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                border: `2px dashed ${DIE_GRAY}60`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                color: `${DIE_GRAY}80`,
              }}
            >
              2
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div style={{ fontSize: 48, color: AMBER_400 }}>→</div>

        {/* Completion */}
        <div
          style={{
            width: 200,
            textAlign: "center",
            opacity: countdownValue === 0 ? 1 : 0.2,
          }}
        >
          <div
            style={{
              fontSize: 48,
              color: SUCCESS,
              fontWeight: 900,
            }}
          >
            ✓
          </div>
          <p style={{ fontSize: 18, color: SUCCESS, marginTop: 8 }}>
            JOB COMPLETE
          </p>
          <p style={{ fontSize: 14, color: PRESTIGE, marginTop: 4 }}>
            +8 Prestige Points
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// Scene 4: SI Crisis
// ============================================================

const SICrisisScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const siValue = Math.max(3, Math.round(interpolate(frame, [0, 90], [22, 3], { extrapolateRight: "clamp" })));
  const shake = siValue < 8 ? Math.sin(frame * 0.8) * 3 : 0;
  const dangerPulse = siValue < 8 ? interpolate(Math.sin(frame * 0.3), [-1, 1], [0.3, 0.8]) : 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: NAVY_950,
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeIn,
        transform: `translateX(${shake}px)`,
      }}
    >
      {/* Danger vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          border: `4px solid ${ALERT_RED}`,
          borderRadius: 0,
          opacity: dangerPulse,
          pointerEvents: "none",
        }}
      />

      <p
        style={{
          fontSize: 20,
          color: STEEL_300,
          marginBottom: 30,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
        }}
      >
        Shipyard Integrity is dropping...
      </p>

      {/* Large SI gauge */}
      <div style={{ width: 600, marginBottom: 30 }}>
        <div
          style={{
            width: "100%",
            height: 40,
            backgroundColor: NAVY_700,
            borderRadius: 20,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Threshold markers */}
          {[20, 10, 5].map((t) => (
            <div
              key={t}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: `${(t / 30) * 100}%`,
                width: 2,
                backgroundColor: `${STEEL_300}40`,
              }}
            />
          ))}
          <div
            style={{
              width: `${(siValue / 30) * 100}%`,
              height: "100%",
              backgroundColor: siValue > 20 ? SUCCESS : siValue > 10 ? AMBER_500 : ALERT_RED,
              borderRadius: 20,
              transition: "width 0.1s",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 8,
            fontSize: 12,
            color: STEEL_300,
          }}
        >
          <span style={{ color: ALERT_RED }}>0</span>
          <span>5</span>
          <span>10</span>
          <span>20</span>
          <span>30</span>
        </div>
      </div>

      <div
        style={{
          fontSize: 72,
          fontWeight: 900,
          color: siValue > 10 ? AMBER_400 : ALERT_RED,
          textShadow: siValue < 8 ? `0 0 30px ${ALERT_RED}` : "none",
        }}
      >
        SI: {siValue}
      </div>

      {/* Warning text */}
      {siValue < 10 && (
        <p
          style={{
            fontSize: 18,
            color: ALERT_RED,
            marginTop: 16,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
          }}
        >
          ⚠ SUPPLY CHAIN SKEPTICISM — PROCUREMENT REDUCED
        </p>
      )}
    </AbsoluteFill>
  );
};

// ============================================================
// Scene 5: CFR Bag Draw
// ============================================================

const CFRDrawScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const revealFrame = 45;
  const isRevealed = frame > revealFrame;
  const tokenScale = isRevealed
    ? interpolate(frame, [revealFrame, revealFrame + 15], [0, 1], { extrapolateRight: "clamp" })
    : 0;
  const shakeX = !isRevealed && frame > 20 ? Math.sin(frame * 2) * 4 : 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: NAVY_950,
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeIn,
      }}
    >
      <p
        style={{
          fontSize: 20,
          color: STEEL_300,
          marginBottom: 40,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
        }}
      >
        Inspection time — draw from the CFR bag
      </p>

      {/* Bag */}
      <div
        style={{
          width: 160,
          height: 200,
          backgroundColor: NAVY_700,
          borderRadius: "20px 20px 40px 40px",
          border: `2px solid ${NAVY_600}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 40,
          transform: `translateX(${shakeX}px)`,
          fontSize: 40,
        }}
      >
        {!isRevealed ? "?" : ""}
      </div>

      {/* Token reveal */}
      {isRevealed && (
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            backgroundColor: `${ALERT_RED}20`,
            border: `3px solid ${ALERT_RED}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${tokenScale})`,
          }}
        >
          <span style={{ fontSize: 32, fontWeight: 900, color: ALERT_RED }}>
            GROWTH
          </span>
          <span style={{ fontSize: 14, color: ALERT_RED, marginTop: 4 }}>
            WORK
          </span>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ============================================================
// Scene 6: End Card
// ============================================================

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = interpolate(frame, [0, 20], [0.8, 1], { extrapolateRight: "clamp" });
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const taglineOpacity = interpolate(frame, [25, 45], [0, 1], { extrapolateRight: "clamp" });
  const featuresOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: NAVY_950,
        justifyContent: "center",
        alignItems: "center",
        background: `radial-gradient(ellipse at center, ${NAVY_800} 0%, ${NAVY_950} 70%)`,
      }}
    >
      <h1
        style={{
          fontSize: 80,
          fontWeight: 900,
          color: STEEL_100,
          letterSpacing: "0.05em",
          transform: `scale(${titleScale})`,
          opacity: titleOpacity,
          textShadow: `0 0 40px ${AMBER_500}40`,
        }}
      >
        DRYDOCK MASTERS
      </h1>

      <div
        style={{
          width: 300,
          height: 3,
          backgroundColor: AMBER_500,
          margin: "16px auto",
          opacity: titleOpacity,
        }}
      />

      <p
        style={{
          fontSize: 24,
          color: AMBER_400,
          letterSpacing: "0.2em",
          opacity: taglineOpacity,
          marginBottom: 40,
        }}
      >
        THE FLEET WON'T WAIT
      </p>

      <div
        style={{
          display: "flex",
          gap: 40,
          opacity: featuresOpacity,
        }}
      >
        {["2-6 Players", "Semi-Cooperative", "12 Rounds", "Online & Local"].map(
          (feat) => (
            <div
              key={feat}
              style={{
                backgroundColor: `${NAVY_700}`,
                border: `1px solid ${NAVY_600}`,
                borderRadius: 8,
                padding: "8px 20px",
                fontSize: 14,
                color: STEEL_300,
                fontWeight: 600,
              }}
            >
              {feat}
            </div>
          )
        )}
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// Shared Components
// ============================================================

const StatItem: React.FC<{ label: string; value: string; color: string }> = ({
  label,
  value,
  color,
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <span style={{ fontSize: 11, color: STEEL_300, textTransform: "uppercase", letterSpacing: "0.1em" }}>
      {label}
    </span>
    <span style={{ fontSize: 18, fontWeight: 700, color }}>{value}</span>
  </div>
);

const SIBar: React.FC<{ frame: number; value: number }> = ({ frame, value }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <span style={{ fontSize: 11, color: STEEL_300, textTransform: "uppercase", letterSpacing: "0.1em" }}>SI</span>
    <div
      style={{
        width: 120,
        height: 16,
        backgroundColor: NAVY_700,
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${(value / 30) * 100}%`,
          height: "100%",
          backgroundColor: value > 20 ? SUCCESS : AMBER_500,
          borderRadius: 8,
        }}
      />
    </div>
    <span style={{ fontSize: 16, fontWeight: 700, color: value > 20 ? SUCCESS : AMBER_400 }}>
      {value}
    </span>
  </div>
);

const WorkSlot: React.FC<{ name: string; frame: number; index: number }> = ({
  name,
  frame,
  index,
}) => {
  const delay = index * 10;
  const scale = interpolate(frame, [delay, delay + 15], [0.9, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [delay, delay + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (!name) {
    return (
      <div
        style={{
          flex: 1,
          height: 140,
          borderRadius: 12,
          border: `2px dashed ${NAVY_600}50`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          color: `${NAVY_600}`,
          opacity,
        }}
      >
        Empty Slot
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: NAVY_800,
        borderRadius: 12,
        border: `1px solid ${NAVY_600}`,
        padding: 16,
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      <h4 style={{ fontSize: 15, fontWeight: 700, color: STEEL_100 }}>{name}</h4>
      <div style={{ fontSize: 12, color: PRESTIGE, marginTop: 4 }}>
        {[3, 5, 8][index]} PP
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
        {Array.from({ length: index + 1 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              backgroundColor: `${SUCCESS}30`,
              border: `1px solid ${SUCCESS}50`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              color: SUCCESS,
            }}
          >
            {3 - index}
          </div>
        ))}
      </div>
    </div>
  );
};
