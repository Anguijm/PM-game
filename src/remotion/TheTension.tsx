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
const NAVY_600 = "#2a3f66";
const STEEL_100 = "#dce4ec";
const STEEL_300 = "#a8b8c8";
const AMBER_400 = "#fbbf24";
const AMBER_500 = "#f59e0b";
const ALERT_RED = "#ef4444";
const SUCCESS = "#22c55e";

const S1 = 10; // "SI just dropped below ten..."
const S2 = 14; // "You could clear the problem..."
const S3 = 6;  // "Drydock Masters..."
const TOTAL = S1 + S2 + S3; // 30s

export const TheTension: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: NAVY_950 }}>
      <Sequence from={0} durationInFrames={S1 * fps}>
        <Scene1Threat />
        <Audio src={staticFile("audio/vo/v2_scene1.wav")} />
      </Sequence>

      <Sequence from={S1 * fps} durationInFrames={S2 * fps}>
        <Scene2Choice />
        <Audio src={staticFile("audio/vo/v2_scene2.wav")} />
      </Sequence>

      <Sequence from={(S1 + S2) * fps} durationInFrames={S3 * fps}>
        <Scene3Outro />
        <Audio src={staticFile("audio/vo/v2_scene3.wav")} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ============ Scene 1: The Threat ============
const Scene1Threat: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const siValue = Math.max(1, Math.round(interpolate(frame, [30, 240], [8, 1], { extrapolateRight: "clamp" })));
  const shake = siValue <= 3 ? Math.sin(frame * 0.8) * 4 : 0;
  const dangerPulse = interpolate(Math.sin(frame * 0.15), [-1, 1], [0.1, 0.6]);
  const bgScale = interpolate(frame, [0, 300], [1.05, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: fadeIn, transform: `translateX(${shake}px)` }}>
      <Img src={staticFile("images/promo/bg-danger-gauge.jpg")}
        style={{
          width: "100%", height: "100%", objectFit: "cover",
          filter: "brightness(0.5)", transform: `scale(${bgScale})`,
        }} />

      {/* Danger border pulse */}
      <div style={{
        position: "absolute", inset: 0,
        border: `4px solid ${ALERT_RED}`,
        opacity: dangerPulse,
      }} />

      {/* SI Counter */}
      <div style={{
        position: "absolute", bottom: 80, left: 0, right: 0,
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>
        {/* SI Bar */}
        <div style={{
          width: 500, height: 32, backgroundColor: `${NAVY_800}cc`,
          borderRadius: 16, overflow: "hidden", border: `1px solid ${NAVY_600}`,
        }}>
          <div style={{
            width: `${(siValue / 30) * 100}%`, height: "100%",
            backgroundColor: siValue > 5 ? AMBER_500 : ALERT_RED,
            borderRadius: 16,
            transition: "width 0.3s",
          }} />
        </div>

        <div style={{
          fontSize: 64, fontWeight: 900, marginTop: 16,
          color: siValue <= 3 ? ALERT_RED : AMBER_400,
          textShadow: siValue <= 3 ? `0 0 30px ${ALERT_RED}` : "none",
        }}>
          SI: {siValue}
        </div>

        <div style={{
          fontSize: 16, color: ALERT_RED, marginTop: 8,
          letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700,
          opacity: siValue <= 5 ? 1 : 0,
        }}>
          EMERGENCY MEASURES ACTIVE
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============ Scene 2: The Choice ============
const Scene2Choice: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  const leftReveal = interpolate(frame, [20, 60], [0, 1], { extrapolateRight: "clamp" });
  const rightReveal = interpolate(frame, [40, 80], [0, 1], { extrapolateRight: "clamp" });

  // Hover effect — cursor oscillates between choices
  const hoverPhase = Math.sin(frame * 0.04);
  const leftGlow = hoverPhase > 0 ? interpolate(hoverPhase, [0, 1], [0, 0.4]) : 0;
  const rightGlow = hoverPhase < 0 ? interpolate(-hoverPhase, [0, 1], [0, 0.4]) : 0;

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <Img src={staticFile("images/promo/bg-split-choice.jpg")}
        style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.35)" }} />

      <div style={{
        position: "absolute", inset: 0, display: "flex",
        justifyContent: "center", alignItems: "center", gap: 60,
      }}>
        {/* Left: Help the Team */}
        <div style={{
          width: 340, padding: "40px 32px", borderRadius: 20,
          backgroundColor: `rgba(37, 99, 235, ${0.15 + leftGlow})`,
          border: `2px solid rgba(96, 165, 250, ${0.4 + leftGlow})`,
          textAlign: "center", opacity: leftReveal,
          transform: `scale(${1 + leftGlow * 0.05})`,
          boxShadow: leftGlow > 0.1 ? `0 0 40px rgba(96, 165, 250, 0.3)` : "none",
        }}>
          <div style={{ fontSize: 40, fontWeight: 900, color: "#60a5fa", marginBottom: 8 }}>+2 SI</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#60a5fa" }}>
            CLEAR THE PROBLEM
          </div>
          <div style={{ fontSize: 13, color: STEEL_300, marginTop: 12, lineHeight: 1.5 }}>
            Earn Prestige, restore the yard. But you lose your turn.
          </div>
        </div>

        {/* VS */}
        <div style={{
          fontSize: 32, fontWeight: 900, color: STEEL_300,
          opacity: interpolate(frame, [60, 80], [0, 1], { extrapolateRight: "clamp" }),
        }}>
          OR
        </div>

        {/* Right: Chase Glory */}
        <div style={{
          width: 340, padding: "40px 32px", borderRadius: 20,
          backgroundColor: `rgba(245, 158, 11, ${0.15 + rightGlow})`,
          border: `2px solid rgba(251, 191, 36, ${0.4 + rightGlow})`,
          textAlign: "center", opacity: rightReveal,
          transform: `scale(${1 + rightGlow * 0.05})`,
          boxShadow: rightGlow > 0.1 ? `0 0 40px rgba(251, 191, 36, 0.3)` : "none",
        }}>
          <div style={{ fontSize: 40, fontWeight: 900, color: AMBER_400, marginBottom: 8 }}>+8 PP</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: AMBER_400 }}>
            STAGE THE BIG JOB
          </div>
          <div style={{ fontSize: 13, color: STEEL_300, marginTop: 12, lineHeight: 1.5 }}>
            Chase the promotion. Hope someone else deals with the fire.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============ Scene 3: Outro ============
const Scene3Outro: React.FC = () => {
  const frame = useCurrentFrame();

  // Hard cut from black
  const titleReveal = interpolate(frame, [15, 30], [0, 1], { extrapolateRight: "clamp" });
  const titleScale = interpolate(frame, [15, 30], [1.3, 1], { extrapolateRight: "clamp" });
  const taglineOpacity = interpolate(frame, [60, 90], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      backgroundColor: NAVY_950,
      justifyContent: "center", alignItems: "center",
    }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{
          fontSize: 88, fontWeight: 900, color: STEEL_100,
          letterSpacing: "-0.02em", opacity: titleReveal,
          transform: `scale(${titleScale})`,
          textShadow: `0 0 60px ${AMBER_500}50`,
        }}>
          DRYDOCK MASTERS
        </h1>

        <div style={{
          width: 400, height: 3, backgroundColor: AMBER_500,
          margin: "20px auto", opacity: titleReveal,
        }} />

        <p style={{
          fontSize: 24, color: AMBER_400, letterSpacing: "0.25em",
          opacity: taglineOpacity, marginTop: 8,
        }}>
          THE FLEET WON'T WAIT
        </p>
      </div>
    </AbsoluteFill>
  );
};
