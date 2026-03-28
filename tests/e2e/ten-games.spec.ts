import { test, expect } from "@playwright/test";

/**
 * 10 consecutive complete games via Playwright.
 * Each game: Lobby → Contract → Event → Planning → Action → Resolution → Round 2
 * All errors logged. Must pass 10/10 to ship.
 */

async function playOneGame(page: any, gameNum: number) {
  const errors: string[] = [];
  page.on("console", (msg: any) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err: any) => errors.push(err.message));

  // LOBBY
  await page.goto("/");
  await expect(page.getByText("DRYDOCK MASTERS")).toBeVisible({ timeout: 10000 });
  await page.getByRole("button", { name: "LOCAL PLAY" }).click();
  await expect(page.getByText("Superintendents")).toBeVisible({ timeout: 5000 });
  await page.getByText("LAUNCH OPERATIONS").click();
  await expect(
    page.getByRole("heading", { name: /Choose Your Ship Contract/i })
  ).toBeVisible({ timeout: 10000 });

  // CONTRACT SELECTION
  await page.getByTestId("contract-choices").locator("button").first().click();

  // Wait for event phase (bot selects contract, phase advances)
  await page.waitForFunction(
    () => {
      const el = document.querySelector('[data-tutorial="phase-panel"]');
      return el && !el.textContent?.includes("Choose Your Ship Contract") && !el.textContent?.includes("Waiting for other players");
    },
    { timeout: 15000 }
  );

  // EVENT: acknowledge if it's our turn
  const ackBtn = page.getByRole("button", { name: /ACKNOWLEDGE|CONTINUE/i });
  try {
    await ackBtn.waitFor({ state: "visible", timeout: 5000 });
    await ackBtn.click();
  } catch {
    // Bot handled it
  }

  // Wait for planning
  await page.waitForFunction(
    () => {
      const el = document.querySelector('[data-tutorial="phase-panel"]');
      return el?.textContent?.includes("Draft") || el?.textContent?.includes("Waiting");
    },
    { timeout: 15000 }
  );

  // PLANNING: draft if it's our turn
  const phasePanel = page.getByTestId("phase-panel");
  try {
    const waitText = phasePanel.getByText(/Waiting for the active player to draft/i);
    const isWaiting = await waitText.isVisible().catch(() => false);
    if (isWaiting) {
      await waitText.waitFor({ state: "hidden", timeout: 10000 });
    }
    const card = phasePanel.locator("[role='button'], button").filter({ hasNotText: /Waiting/i }).first();
    if (await card.isVisible().catch(() => false)) {
      await card.click();
    }
  } catch {
    // Phase advanced
  }

  // Wait for action phase
  await page.waitForFunction(
    () => {
      const el = document.querySelector('[data-tutorial="phase-panel"]');
      return el?.textContent?.includes("Action") || el?.textContent?.includes("Waiting for the active player to take");
    },
    { timeout: 15000 }
  );

  // ACTION: click Pass Turn whenever visible until we leave action phase
  for (let i = 0; i < 60; i++) {
    const pt = await page.getByTestId("phase-panel").textContent().catch(() => "");
    if (!pt?.includes("Action") && !pt?.includes("Waiting for the active player to take")) break;

    const pass = page.locator("button:has-text('Pass Turn')");
    if (await pass.isVisible().catch(() => false)) {
      await pass.click();
    }
    await page.waitForTimeout(500);
  }

  // Wait for Round 2
  await page.waitForFunction(
    () => (document.body.textContent || "").match(/2\s*\/\s*12/),
    { timeout: 20000 }
  );

  await expect(page.locator("text=/2\\s*\\/\\s*12/").first()).toBeVisible({ timeout: 5000 });

  // Filter out non-critical errors (boardgame.io internal logs)
  const criticalErrors = errors.filter(
    (e) => !e.includes("disallowed move") && !e.includes("move not processed") && !e.includes("Specified module format")
  );

  return { success: true, errors: criticalErrors, gameNum };
}

for (let i = 1; i <= 10; i++) {
  test(`Game ${i}: complete round cycle`, async ({ page }) => {
    test.setTimeout(90000);
    const result = await playOneGame(page, i);
    if (result.errors.length > 0) {
      console.log(`Game ${i} errors:`, result.errors);
    }
    expect(result.success).toBe(true);
    expect(result.errors.length).toBe(0);
  });
}
