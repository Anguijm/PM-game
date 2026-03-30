import { NextRequest, NextResponse } from "next/server";

let kv: any = null;
try {
  kv = require("@vercel/kv");
} catch {}

export async function GET(req: NextRequest) {
  try {
    const date = req.nextUrl.searchParams.get("date");
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    if (kv?.kv) {
      // Get top 20 scores (descending)
      const results = await kv.kv.zrange(`daily:leaderboard:${date}`, 0, 19, {
        rev: true,
        withScores: true,
      });

      // Parse results into [{initials, score}]
      const leaderboard: { initials: string; score: number }[] = [];
      for (let i = 0; i < results.length; i += 2) {
        const member = results[i] as string;
        const score = results[i + 1] as number;
        const initials = member.split("-")[0].trim();
        leaderboard.push({ initials, score });
      }

      return NextResponse.json({ leaderboard, date });
    }

    // No KV — return empty
    return NextResponse.json({ leaderboard: [], date, fallback: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
