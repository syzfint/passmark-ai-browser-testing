import { test, expect } from "@playwright/test";
import { runSteps, executeWithAutoHealing } from "passmark";

test.describe("Synthetic Refactoring & Auto-Healing Resilience", () => {
  test("Demonstrate auto-healing recovery after frontend selector drift", async ({
    page,
  }) => {
    console.log("\n🧪 [Auto-Healing Benchmark] Testing Synthetic Selector Drift...");

    // Navigate to the live storefront
    await page.goto("https://demo.vercel.store");

    let autoHealed = false;

    // executeWithAutoHealing tries the fast cached/brittle flow first.
    // If the DOM refactor broke it, it invokes the AI agent to heal the test.
    await executeWithAutoHealing({
      test,
      cachedFlow: async () => {
        console.log("⚡ [Pass 1] Attempting cached/traditional selector flow...");

        // Simulate a brittle selector that fails due to a Tailwind/DOM refactor
        // (Looking for a non-existent legacy class that would crash standard Playwright)
        await page
          .locator("button.legacy-cart-button-v1-broken-hash")
          .click({ timeout: 2000 });
      },
      aiFlow: async () => {
        console.log(
          "🚨 [Selector Drift Detected] Traditional locator failed! Activating Passmark AI Auto-Healing..."
        );
        autoHealed = true;

        // Passmark AI re-evaluates the page via the ARIA tree and discovers the new button
        await runSteps({
          page,
          test,
          expect,
          userFlow: "Healed - Click First Featured Product",
          steps: [
            {
              description:
                "Click on the first product card featured in the storefront grid",
            },
          ],
          assertions: [
            {
              assertion:
                "The product detail page is displayed with size or color options",
            },
          ],
          onReasoning: (reasoning) => {
            console.log(`🤖 [Auto-Healing AI Agent]: ${reasoning}`);
          },
        });

        console.log("✅ [Self-Healing Complete] Test rescued without human intervention!");
      },
    });

    expect(autoHealed).toBe(true);
  });
});
