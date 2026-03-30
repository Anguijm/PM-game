import { NextRequest, NextResponse } from "next/server";

// Vercel KV — gracefully degrades if not configured
let kv: any = null;
try {
  kv = require("@vercel/kv");
} catch {}

export async function POST(req: NextRequest) {
  try {
    const { initials, score, date, deviceId } = await req.json();

    // Validate
    if (!initials || typeof initials !== "string" || initials.length > 3) {
      return NextResponse.json({ error: "Invalid initials" }, { status: 400 });
    }
    if (typeof score !== "number" || score < 0 || score > 999) {
      return NextResponse.json({ error: "Invalid score" }, { status: 400 });
    }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }
    if (!deviceId) {
      return NextResponse.json({ error: "Missing deviceId" }, { status: 400 });
    }

    // Check if this device already submitted today
    if (kv?.kv) {
      const existingKey = `daily:submitted:${date}:${deviceId}`;
      const existing = await kv.kv.get(existingKey);
      if (existing) {
        return NextResponse.json({ error: "Already submitted today" }, { status: 409 });
      }

      // Save score to sorted set (higher is better)
      const member = `${initials.toUpperCase().padEnd(3, " ")}-${deviceId.slice(0, 8)}`;
      await kv.kv.zadd(`daily:leaderboard:${date}`, { score, member });

      // Mark as submitted (expire after 48 hours)
      await kv.kv.set(existingKey, "1", { ex: 172800 });

      // Expire leaderboard after 7 days
      await kv.kv.expire(`daily:leaderboard:${date}`, 604800);
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
