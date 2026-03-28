import { test, expect } from "@playwright/test";

test("Debug bot through full round", async ({ page }) => {
  test.setTimeout(60000);

  const logs: string[] = [];
  page.on("console", (msg) => {
    if (msg.text().includes("[BOT]")) logs.push(msg.text());
  });

  await page.goto("/");
  await page.getByRole("button", { name: "LOCAL PLAY" }).click();
  await page.getByText("LAUNCH OPERATIONS").click();

  // Contract selection
  await expect(page.getByRole("heading", { name: /Choose Your Ship Contract/i })).toBeVisible({ timeout: 10000 });
  await page.getByTestId("contract-choices").locator("button").first().click();

  // Wait 3s for bot to select contract + phase advance
  await page.waitForTimeout(3000);

  // Event: find and click acknowledge
  const ackBtn = page.getByRole("button", { name: /ACKNOWLEDGE|CONTINUE/i });
  try {
    await ackBtn.waitFor({ state: "visible", timeout: 5000 });
    await ackBtn.click();
  } catch {
    console.log("No ack button — bot may have handled event");
  }
  await page.waitForTimeout(3000);

  // Planning: draft
  const phasePanel = page.getByTestId("phase-panel");
  try {
    // Wait for draft UI or "Waiting" text
    await phasePanel.waitFor({ timeout: 5000 });
    const draftBtn = phasePanel.locator("[role='button'], button").filter({ hasNotText: /Waiting/i }).first();
    const canDraft = await draftBtn.isVisible().catch(() => false);
    if (canDraft) await draftBtn.click();
  } catch {}
  await page.waitForTimeout(3000);

  // Action: just pass if it's our turn
  const passBtn = page.getByRole("button", { name: /Pass Turn/i });
  try {
    await passBtn.waitFor({ state: "visible", timeout: 5000 });
    await passBtn.click();
  } catch {
    console.log("No pass button visible");
  }

  // Wait 10s for bot to take its turn
  await page.waitForTimeout(10000);

  console.log("\n=== BOT LOGS ===");
  for (const l of logs) console.log(l);
  console.log(`Total: ${logs.length}`);

  // Capture final state
  await page.screenshot({ path: "tests/e2e/screenshots/debug-final.png" });
  const bodyText = await page.locator("body").textContent();
  const phase = bodyText?.match(/(CONTRACT SELECTION|EVENT|PLANNING|ACTION|RESOLUTION)/)?.[0] || "UNKNOWN";
  console.log("Final phase:", phase);
  const round = bodyText?.match(/(\d+)\s*\/\s*12/)?.[1] || "?";
  console.log("Final round:", round);
});
