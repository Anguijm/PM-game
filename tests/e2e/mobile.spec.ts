import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 375, height: 812 } });

test.describe("Mobile responsive", () => {
  test("Lobby loads and game starts on mobile", async ({ page }) => {
    test.setTimeout(60000);

    await page.goto("/");
    await expect(page.getByText("DRYDOCK MASTERS")).toBeVisible();

    // Buttons should be tappable
    await page.getByRole("button", { name: "LOCAL PLAY" }).click();
    await expect(page.getByText("Superintendents")).toBeVisible({ timeout: 5000 });

    // Both seats as bots for quick test
    const seat1 = page.locator("select").first();
    await seat1.selectOption("balanced");

    await page.getByText("LAUNCH OPERATIONS").click();

    // Game should load — wait for contract selection or game content
    await page.waitForFunction(
      () => document.body.textContent?.includes("Contract") || document.body.textContent?.includes("Round"),
      { timeout: 15000 }
    );

    // Mobile nav should be visible
    await expect(page.locator("nav").filter({ hasText: "Board" })).toBeVisible();

    // Take screenshots at different tabs
    await page.screenshot({ path: "tests/e2e/screenshots/mobile-board.png" });

    // Tap Market tab
    await page.getByRole("button", { name: "Market" }).click();
    await page.screenshot({ path: "tests/e2e/screenshots/mobile-market.png" });

    // Tap Info tab
    await page.getByRole("button", { name: "Info" }).click();
    await page.screenshot({ path: "tests/e2e/screenshots/mobile-info.png" });
  });
});
