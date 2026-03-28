import { test, expect } from "@playwright/test";

/**
 * Drydock Masters — Complete Game Loop E2E Test
 * Tests full happy path: Lobby → Contract → Event → Planning → Action → Resolution → Round 2
 */

test.describe("Complete 2-player local game loop", () => {
  test("Human vs Bot: full round cycle", async ({ page }) => {
    test.setTimeout(120000);

    // ================================================================
    // STEP 1: LOBBY → START GAME
    // ================================================================
    await test.step("Load lobby and start local game", async () => {
      await page.goto("/");
      await expect(page.getByText("DRYDOCK MASTERS")).toBeVisible();
      await page.getByText("LOCAL PLAY").click();
      await expect(page.getByText("Superintendents")).toBeVisible();
      await page.getByText("LAUNCH OPERATIONS").click();
      await expect(
        page.getByRole("heading", { name: /Choose Your Ship Contract/i })
      ).toBeVisible({ timeout: 10000 });
    });

    // ================================================================
    // STEP 2: CONTRACT SELECTION
    // ================================================================
    await test.step("Select contract and wait for bot", async () => {
      const contractGrid = page.getByTestId("contract-choices");
      await expect(contractGrid).toBeVisible();
      await contractGrid.locator("button").first().click();

      // Wait for "Waiting for other players" or phase change
      // Bot gets its turn next (sequential), then phase advances
      // The phase indicator in top bar will change from "CONTRACT SELECTION" to "EVENT"
      await page.waitForFunction(
        () => {
          const el = document.querySelector('[data-tutorial="phase-panel"]');
          // Phase panel content changes when phase advances
          return el && !el.textContent?.includes("Choose Your Ship Contract");
        },
        { timeout: 15000 }
      );
    });

    // ================================================================
    // STEP 3: EVENT PHASE
    // ================================================================
    await test.step("Handle event phase", async () => {
      // Wait for event content or acknowledge button
      const ackButton = page.getByRole("button", { name: /ACKNOWLEDGE|CONTINUE/i });

      // If we see the ack button, it's our turn — click it
      // If not visible within 5s, bot handled it already
      try {
        await ackButton.waitFor({ state: "visible", timeout: 8000 });
        await ackButton.click();
      } catch {
        // Bot acknowledged — phase should advance on its own
      }

      // Wait for planning phase to appear
      await page.waitForFunction(
        () => {
          const el = document.querySelector('[data-tutorial="phase-panel"]');
          return el?.textContent?.includes("Draft") || el?.textContent?.includes("Waiting");
        },
        { timeout: 15000 }
      );
    });

    // ================================================================
    // STEP 4: PLANNING PHASE (DRAFT)
    // ================================================================
    await test.step("Draft a card", async () => {
      const phasePanel = page.getByTestId("phase-panel");

      // If it says "Waiting", bot drafts first — wait for our turn
      const waitingText = phasePanel.getByText(/Waiting for the active player to draft/i);
      try {
        await waitingText.waitFor({ state: "visible", timeout: 3000 });
        // Bot goes first, wait for it to finish
        await waitingText.waitFor({ state: "hidden", timeout: 10000 });
      } catch {
        // We go first
      }

      // Now we should see the draft UI — click the first card
      const draftCards = phasePanel.locator("[role='button'], button").filter({ hasNotText: /Waiting/i });
      const firstCard = draftCards.first();
      try {
        await firstCard.waitFor({ state: "visible", timeout: 5000 });
        await firstCard.click();
      } catch {
        // Phase may have auto-advanced
      }

      // Wait for Action phase
      await page.waitForFunction(
        () => {
          const el = document.querySelector('[data-tutorial="phase-panel"]');
          return el?.textContent?.includes("Action Phase") || el?.textContent?.includes("Waiting for the active player to take actions");
        },
        { timeout: 15000 }
      );
    });

    // ================================================================
    // STEP 5: ACTION PHASE
    // ================================================================
    await test.step("Take actions and pass", async () => {
      // Wait until we see either action buttons (our turn) or waiting text (bot's turn)
      await page.waitForFunction(
        () => {
          const panel = document.querySelector('[data-tutorial="phase-panel"]');
          return panel?.textContent?.includes("Action Phase") || panel?.textContent?.includes("Waiting");
        },
        { timeout: 10000 }
      );

      // Keep trying until phase changes to resolution
      // This handles: bot goes first → we go → bot passes → we pass → resolution
      let attempts = 0;
      while (attempts < 30) {
        const phaseText = await page.getByTestId("phase-panel").textContent().catch(() => "");

        // If we're past action phase, break
        if (phaseText?.includes("Resolution") || !phaseText?.includes("Action")) break;

        // If it's our turn (action buttons visible)
        const passBtn = page.getByRole("button", { name: /Pass Turn/i });
        const hasTurn = await passBtn.isVisible().catch(() => false);

        if (hasTurn) {
          // Take a procurement action if we have actions left
          const procureBtn = page.getByRole("button", { name: /Procurement/i }).first();
          const canProcure = await procureBtn.isVisible().catch(() => false);
          if (canProcure) {
            await procureBtn.click();
            await page.waitForTimeout(300);
          }
          // Pass
          const canPass = await passBtn.isVisible().catch(() => false);
          if (canPass) {
            await passBtn.click();
            await page.waitForTimeout(500);
          }
        }

        await page.waitForTimeout(500); // Wait for bot moves
        attempts++;
      }

      // Verify we reached resolution
      await page.waitForFunction(
        () => {
          const panel = document.querySelector('[data-tutorial="phase-panel"]');
          return panel?.textContent?.includes("Resolution");
        },
        { timeout: 15000 }
      );
    });

    // ================================================================
    // STEP 6: RESOLUTION PHASE
    // ================================================================
    await test.step("Acknowledge resolution", async () => {
      const continueBtn = page.getByRole("button", { name: /CONTINUE TO NEXT ROUND|VIEW FINAL/i });

      try {
        await continueBtn.waitFor({ state: "visible", timeout: 10000 });
        await continueBtn.click();
      } catch {
        // Bot handled it
      }

      // Wait for next round event phase
      await page.waitForFunction(
        () => {
          const roundText = document.body.textContent || "";
          return roundText.includes("2 /") || roundText.includes("2/");
        },
        { timeout: 15000 }
      );
    });

    // ================================================================
    // STEP 7: VERIFY ROUND 2
    // ================================================================
    await test.step("Verify round 2 started", async () => {
      // Round indicator should show 2
      await expect(page.locator("text=/2\\s*\\/\\s*12/").first()).toBeVisible({ timeout: 5000 });

      await page.screenshot({
        path: "tests/e2e/screenshots/round2-reached.png",
      });
    });
  });
});
