/**
 * Generate simple sound effects as WAV files using pure math.
 * No external audio libraries needed — just write PCM data.
 */

import { writeFileSync } from "fs";

const SAMPLE_RATE = 44100;

function generateWav(samples: Float32Array): Buffer {
  const numSamples = samples.length;
  const buffer = Buffer.alloc(44 + numSamples * 2);

  // WAV header
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // chunk size
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32); // block align
  buffer.writeUInt16LE(16, 34); // bits per sample
  buffer.write("data", 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  // PCM data
  for (let i = 0; i < numSamples; i++) {
    const val = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(val * 32767), 44 + i * 2);
  }

  return buffer;
}

function envelope(t: number, attack: number, decay: number, duration: number): number {
  if (t < attack) return t / attack;
  if (t < attack + decay) return 1 - ((t - attack) / decay) * 0.5;
  const release = duration - t;
  if (release < 0.05) return Math.max(0, release / 0.05) * 0.5;
  return 0.5;
}

// 1. Click/snap — short metallic transient
function genClick(): Float32Array {
  const dur = 0.08;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * dur));
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 80);
    samples[i] = env * (Math.random() * 2 - 1) * 0.6;
  }
  return samples;
}

// 2. Clunk — heavier mechanical lock
function genClunk(): Float32Array {
  const dur = 0.15;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * dur));
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 30);
    const tone = Math.sin(2 * Math.PI * 120 * t) * 0.4;
    const noise = (Math.random() * 2 - 1) * 0.3;
    samples[i] = env * (tone + noise);
  }
  return samples;
}

// 3. Tick — clock tick
function genTick(): Float32Array {
  const dur = 0.05;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * dur));
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 100);
    samples[i] = env * Math.sin(2 * Math.PI * 800 * t) * 0.3;
  }
  return samples;
}

// 4. Chime — positive completion
function genChime(): Float32Array {
  const dur = 0.5;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * dur));
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 5);
    const f1 = Math.sin(2 * Math.PI * 880 * t) * 0.3;
    const f2 = Math.sin(2 * Math.PI * 1320 * t) * 0.2;
    const f3 = Math.sin(2 * Math.PI * 1760 * t) * 0.1;
    samples[i] = env * (f1 + f2 + f3);
  }
  return samples;
}

// 5. Warning buzz
function genBuzz(): Float32Array {
  const dur = 0.3;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * dur));
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 4);
    const saw = ((t * 150) % 1) * 2 - 1;
    samples[i] = env * saw * 0.4;
  }
  return samples;
}

// 6. Alarm — brief warning tone
function genAlarm(): Float32Array {
  const dur = 0.6;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * dur));
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    const env = (1 + Math.sin(2 * Math.PI * 8 * t)) * 0.25;
    samples[i] = env * Math.sin(2 * Math.PI * 600 * t) * 0.5;
  }
  return samples;
}

// 7. Whoosh — paper/card reveal
function genWhoosh(): Float32Array {
  const dur = 0.25;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * dur));
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.sin(Math.PI * t / dur);
    const noise = (Math.random() * 2 - 1);
    // Bandpass via frequency sweep
    const freq = 2000 + t * 8000;
    const bp = Math.sin(2 * Math.PI * freq * t);
    samples[i] = env * noise * bp * 0.15;
  }
  return samples;
}

// 8. Stamp — heavy completion
function genStamp(): Float32Array {
  const dur = 0.2;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * dur));
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 25);
    const thud = Math.sin(2 * Math.PI * 80 * t) * 0.6;
    const crack = Math.exp(-t * 60) * (Math.random() * 2 - 1) * 0.4;
    samples[i] = env * thud + crack;
  }
  return samples;
}

// 9. Fanfare — victory
function genFanfare(): Float32Array {
  const dur = 1.0;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * dur));
  const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    let val = 0;
    for (let n = 0; n < notes.length; n++) {
      const noteStart = n * 0.15;
      if (t >= noteStart) {
        const nt = t - noteStart;
        const env = Math.exp(-nt * 3);
        val += env * Math.sin(2 * Math.PI * notes[n] * t) * 0.15;
      }
    }
    samples[i] = val;
  }
  return samples;
}

// 10. Defeat horn — low, somber
function genDefeat(): Float32Array {
  const dur = 1.2;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * dur));
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 1.5);
    const f1 = Math.sin(2 * Math.PI * 110 * t) * 0.4;
    const f2 = Math.sin(2 * Math.PI * 138 * t) * 0.2; // minor third
    samples[i] = env * (f1 + f2);
  }
  return samples;
}

// Generate all
const sfx: Record<string, Float32Array> = {
  click: genClick(),
  clunk: genClunk(),
  tick: genTick(),
  chime: genChime(),
  buzz: genBuzz(),
  alarm: genAlarm(),
  whoosh: genWhoosh(),
  stamp: genStamp(),
  fanfare: genFanfare(),
  defeat: genDefeat(),
};

for (const [name, samples] of Object.entries(sfx)) {
  const wav = generateWav(samples);
  writeFileSync(`public/audio/sfx/${name}.wav`, wav);
  console.log(`Generated ${name}.wav (${(wav.length / 1024).toFixed(1)}KB)`);
}

console.log("Done!");
