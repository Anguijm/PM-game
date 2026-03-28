import { test, expect } from "@playwright/test";

test("Debug: both bots game state after 30s", async ({ page }) => {
  test.setTimeout(60000);

  const logs: string[] = [];
  page.on("console", (msg) => {
    const t = msg.text();
    if (t.includes("[BOT]") || t.includes("ERROR") || t.includes("disallowed")) {
      logs.push(t);
    }
  });

  await page.goto("/");
  await page.getByRole("button", { name: "LOCAL PLAY" }).click();

  // Both seats as bots
  const seat1 = page.locator("select").first();
  await seat1.selectOption("balanced");

  await page.getByText("LAUNCH OPERATIONS").click();

  // Wait 30 seconds
  await page.waitForTimeout(30000);

  console.log("=== CONSOLE LOGS ===");
  for (const l of logs.slice(-30)) console.log(l);
  console.log(`Total logs: ${logs.length}`);

  // Check page state
  const body = await page.locator("body").innerText().catch(() => "");
  const phase = body.match(/(CONTRACT SELECTION|EVENT|PLANNING|ACTION|RESOLUTION)/)?.[0];
  const round = body.match(/(\d+)\s*\/\s*12/)?.[1];
  console.log(`State: phase=${phase} round=${round}`);

  await page.screenshot({ path: "tests/e2e/screenshots/debug-stuck.png" });
});
