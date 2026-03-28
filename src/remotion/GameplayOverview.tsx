import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from "remotion";

const NAVY_950 = "#0a0e1a";
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

// Scene durations (seconds, from audio + padding)
const S1 = 8; // "The fleet is damaged..."
const S2 = 15; // "Take command..."
const S3 = 23; // "You must work together..."
const S4 = 12; // "Will you save..."
const TOTAL = S1 + S2 + S3 + S4; // 58s

export const GameplayOverview: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: NAVY_950 }}>
      {/* Scene 1: The Hook */}
      <Sequence from={0} durationInFrames={S1 * fps}>
        <Scene1Hook />
        <Audio src={staticFile("audio/vo/v1_scene1.wav")} />
      </Sequence>

      {/* Scene 2: Core Mechanics */}
      <Sequence from={S1 * fps} durationInFrames={S2 * fps}>
        <Scene2Mechanics />
        <Audio src={staticFile("audio/vo/v1_scene2.wav")} />
      </Sequence>

      {/* Scene 3: Semi-Cooperative Hook */}
      <Sequence from={(S1 + S2) * fps} durationInFrames={S3 * fps}>
        <Scene3SemiCoop />
        <Audio src={staticFile("audio/vo/v1_scene3.wav")} />
      </Sequence>

      {/* Scene 4: Call to Action */}
      <Sequence from={(S1 + S2 + S3) * fps} durationInFrames={S4 * fps}>
        <Scene4CTA />
        <Audio src={staticFile("audio/vo/v1_scene4.wav")} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ============ Scene 1: The Hook ============
const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [0, 30], [50, 0], { extrapolateRight: "clamp" });
  const bgScale = interpolate(frame, [0, 240], [1.1, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <Img
        src={staticFile("images/promo/bg-shipyard.jpg")}
        style={{
          width: "100%", height: "100%", objectFit: "cover",
          transform: `scale(${bgScale})`,
          filter: "brightness(0.5)",
        }}
      />
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        opacity: titleOpacity, transform: `translateY(${titleY}px)`,
      }}>
        <h1 style={{
          fontSize: 96, fontWeight: 900, color: STEEL_100,
          letterSpacing: "0.05em", fontFamily: "system-ui",
          textShadow: `0 0 60px ${AMBER_500}60, 0 4px 20px rgba(0,0,0,0.8)`,
        }}>
          DRYDOCK MASTERS
        </h1>
        <div style={{ width: 300, height: 3, backgroundColor: AMBER_500, marginTop: 16, borderRadius: 2 }} />
      </div>
    </AbsoluteFill>
  );
};

// ============ Scene 2: Core Mechanics ============
const Scene2Mechanics: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  const diceColors = [DIE_RED, DIE_BLUE, DIE_YELLOW, DIE_GREEN, DIE_GRAY];
  const diceLabels = ["H", "E", "L", "C", "W"];
  const diceValues = [3, 2, 4, 1, 3];

  // Dice countdown animation
  const countdownPhase = Math.floor(frame / 60);
  const currentValues = diceValues.map((v) => Math.max(0, v - countdownPhase));

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <Img src={staticFile("images/promo/bg-blueprint.jpg")}
        style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.4)" }} />

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center", gap: 40 }}>

        {/* Work Order Card */}
        <div style={{
          backgroundColor: `${NAVY_800}ee`, borderRadius: 16, padding: "24px 40px",
          border: `1px solid ${NAVY_600}`, minWidth: 400,
        }}>
          <div style={{ fontSize: 14, color: AMBER_400, letterSpacing: "0.15em", textTransform: "uppercase" }}>
            Work Order
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: STEEL_100, marginTop: 8 }}>
            Main Engine Rebuild
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 8, fontSize: 14, color: STEEL_300 }}>
            <span style={{ color: PRESTIGE }}>8 PP</span>
            <span>4M cost</span>
            <span style={{ color: AMBER_400 }}>HIGH PROFILE</span>
          </div>
        </div>

        {/* Labor Dice */}
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <span style={{ fontSize: 14, color: STEEL_300, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Labor Dice
          </span>
          {diceColors.map((color, i) => {
            const delay = i * 8;
            const scale = interpolate(frame, [delay, delay + 15], [0, 1], {
              extrapolateLeft: "clamp", extrapolateRight: "clamp",
            });
            const pulse = currentValues[i] === 0 ? Math.sin(frame * 0.3) * 0.1 + 1 : 1;
            return (
              <div key={i} style={{
                width: 64, height: 64, borderRadius: 12, backgroundColor: color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28, fontWeight: 700, color: color === DIE_YELLOW ? NAVY_950 : "white",
                transform: `scale(${scale * pulse})`,
                boxShadow: currentValues[i] === 0 ? `0 0 20px ${SUCCESS}80` : "none",
              }}>
                {currentValues[i]}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============ Scene 3: Semi-Cooperative Hook ============
const Scene3SemiCoop: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const splitReveal = interpolate(frame, [30, 90], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <Img src={staticFile("images/promo/bg-split-choice.jpg")}
        style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.6)" }} />

      <div style={{ position: "absolute", inset: 0, display: "flex" }}>
        {/* Left: Team / SI */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
          alignItems: "center", opacity: splitReveal,
          background: `linear-gradient(135deg, rgba(37,99,235,0.2) 0%, transparent 100%)`,
        }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>🛡️</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#60a5fa", letterSpacing: "0.1em" }}>
            SHIPYARD INTEGRITY
          </div>
          <div style={{ fontSize: 14, color: STEEL_300, marginTop: 8, textAlign: "center", maxWidth: 300 }}>
            Keep it above zero or everyone loses
          </div>
        </div>

        {/* Divider */}
        <div style={{
          width: 3, backgroundColor: `${AMBER_500}80`,
          opacity: splitReveal,
        }} />

        {/* Right: Individual / PP */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
          alignItems: "center", opacity: splitReveal,
          background: `linear-gradient(225deg, rgba(245,158,11,0.2) 0%, transparent 100%)`,
        }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>🏅</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: AMBER_400, letterSpacing: "0.1em" }}>
            PRESTIGE POINTS
          </div>
          <div style={{ fontSize: 14, color: STEEL_300, marginTop: 8, textAlign: "center", maxWidth: 300 }}>
            Only the highest scorer wins
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============ Scene 4: Call to Action ============
const Scene4CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = interpolate(frame, [0, 20], [0.8, 1], { extrapolateRight: "clamp" });
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const taglineOpacity = interpolate(frame, [60, 90], [0, 1], { extrapolateRight: "clamp" });
  const featuresOpacity = interpolate(frame, [90, 120], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at center, ${NAVY_800} 0%, ${NAVY_950} 70%)`,
      justifyContent: "center", alignItems: "center",
    }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{
          fontSize: 80, fontWeight: 900, color: STEEL_100, letterSpacing: "0.05em",
          transform: `scale(${titleScale})`, opacity: titleOpacity,
          textShadow: `0 0 40px ${AMBER_500}40`,
        }}>
          DRYDOCK MASTERS
        </h1>

        <div style={{ width: 300, height: 3, backgroundColor: AMBER_500, margin: "16px auto", opacity: titleOpacity }} />

        <p style={{ fontSize: 28, color: AMBER_400, letterSpacing: "0.2em", opacity: taglineOpacity, marginTop: 16 }}>
          THE FLEET WON'T WAIT
        </p>

        <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 40, opacity: featuresOpacity }}>
          {["2-6 Players", "Semi-Cooperative", "Online & Local", "Play Free"].map((f) => (
            <div key={f} style={{
              backgroundColor: NAVY_700, border: `1px solid ${NAVY_600}`,
              borderRadius: 8, padding: "8px 20px", fontSize: 14, color: STEEL_300, fontWeight: 600,
            }}>{f}</div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
