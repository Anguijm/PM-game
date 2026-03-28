import { test, expect } from "@playwright/test";

test("Debug bot behavior", async ({ page }) => {
  test.setTimeout(30000);

  // Capture browser console
  const logs: string[] = [];
  page.on("console", (msg) => {
    if (msg.text().includes("[BOT]")) {
      logs.push(msg.text());
    }
  });

  await page.goto("/");
  await page.getByText("LOCAL PLAY").click();
  await page.getByText("LAUNCH OPERATIONS").click();

  // Wait for contract selection
  await expect(
    page.getByRole("heading", { name: /Choose Your Ship Contract/i })
  ).toBeVisible({ timeout: 10000 });

  // Select first contract
  const grid = page.getByTestId("contract-choices");
  await grid.locator("button").first().click();

  // Wait 15 seconds and collect all bot logs
  await page.waitForTimeout(15000);

  console.log("=== BOT CONSOLE LOGS ===");
  for (const log of logs) {
    console.log(log);
  }
  console.log(`=== Total: ${logs.length} bot log entries ===`);

  // Check current page state
  const bodyText = await page.locator("body").textContent();
  console.log("Current phase indicators:",
    bodyText?.includes("EVENT") ? "EVENT" :
    bodyText?.includes("PLANNING") ? "PLANNING" :
    bodyText?.includes("ACTION") ? "ACTION" :
    bodyText?.includes("CONTRACT") ? "CONTRACT" : "UNKNOWN"
  );
});
