import { test, expect } from "@playwright/test";

/**
 * 10 complete games played to conclusion.
 * Both players are bots — we just watch and capture results.
 * This tests the game engine + bot + UI integration end-to-end.
 */

async function playFullGame(page: any, gameNum: number): Promise<{
  winner: string;
  result: string;
  rounds: number;
}> {
  // Start game with BOTH seats as bots
  await page.goto("/");
  await expect(page.getByText("DRYDOCK MASTERS")).toBeVisible({ timeout: 10000 });
  await page.getByRole("button", { name: "LOCAL PLAY" }).click();
  await expect(page.getByText("Superintendents")).toBeVisible({ timeout: 5000 });

  // Set seat 1 to bot too
  const seat1Select = page.locator("select").first();
  await seat1Select.selectOption("balanced");

  await page.getByText("LAUNCH OPERATIONS").click();

  // Wait for game to complete — both bots play automatically
  // Game over shows "SHIPYARD FAILURE" or "MISSION COMPLETE"
  const gameOver = page.getByText(/SHIPYARD FAILURE|MISSION COMPLETE/i);
  await gameOver.waitFor({ state: "visible", timeout: 300000 }); // 5 min max

  // Extract results
  const body = await page.locator("body").innerText().catch(() => "");
  let winner = "Unknown";
  let result = "unknown";

  if (body.includes("SHIPYARD FAILURE")) {
    result = "LOSS";
    winner = "Nobody";
  } else if (body.includes("MISSION COMPLETE")) {
    result = "WIN";
    const m = body.match(/(?:Winner|Promoted):\s*(Player\s*\d+)/i);
    winner = m ? m[1] : "Winner shown";
  }

  const roundMatch = body.match(/(\d+)\s*\/\s*12/);
  const rounds = roundMatch ? parseInt(roundMatch[1], 10) : 0;

  return { winner, result, rounds };
}

for (let i = 1; i <= 10; i++) {
  test(`Game ${i}: play to completion`, async ({ page }) => {
    test.setTimeout(600000);
    const result = await playFullGame(page, i);
    console.log(`Game ${i}: ${result.result} | Round ${result.rounds}/12 | ${result.winner}`);
    expect(["WIN", "LOSS"]).toContain(result.result);
  });
}
