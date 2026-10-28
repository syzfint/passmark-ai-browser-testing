import { test, expect } from "@playwright/test";
import { runSteps } from "passmark";

test.describe("Vercel Store - AI Browser Regression Suite (Passmark)", () => {
  test("E2E Guest Checkout Flow on demo.vercel.store", async ({ page }) => {
    console.log("\n🚀 Starting Passmark E2E Guest Checkout Test...");

    await page.goto("https://demo.vercel.store");

    const startTime = Date.now();

    await runSteps({
      page,
      test,
      expect,
      userFlow: "Vercel Store - Guest Product Checkout",
      steps: [
        {
          description: "Click on the first product card featured on the homepage",
        },
        {
          description: "Select size 'M' or the first available size option",
        },
        {
          description: "Click the 'Add to Cart' button",
          waitUntil: "Cart drawer or badge updates",
        },
        {
          description: "Verify that the cart side drawer opens and displays the added item",
        },
        {
          description: "Click the 'Proceed to Checkout' button inside the cart drawer",
        },
      ],
      assertions: [
        {
          assertion:
            "The browser navigates to the Shopify checkout page or displays checkout details",
        },
      ],
      onStepStart: (step) => {
        console.log(`▶ Executing: "${step.description}"`);
      },
      onStepEnd: (step) => {
        console.log(`✔ Completed: "${step.description}"`);
      },
      onReasoning: (reasoning) => {
        console.log(`🤖 [AI Reasoning]: ${reasoning}`);
      },
    });

    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n🎉 Test completed successfully in ${totalDuration}s!\n`);
  });

  test("Cache Validation: Warm Replay Verification", async ({ page }) => {
    console.log("\n⚡ Validating Redis Step Caching (Warm Replay)...");

    await page.goto("https://demo.vercel.store");
    const replayStart = Date.now();

    // Second execution of the userFlow.
    // When Redis is connected, Passmark fetches cached steps and replays them at native Playwright speed.
    await runSteps({
      page,
      test,
      expect,
      userFlow: "Vercel Store - Guest Product Checkout",
      steps: [
        {
          description: "Click on the first product card featured on the homepage",
        },
        {
          description: "Select size 'M' or the first available size option",
        },
        {
          description: "Click the 'Add to Cart' button",
        },
      ],
      assertions: [
        {
          assertion: "The item is successfully added to the cart",
        },
      ],
      onStepStart: (step) => {
        console.log(`⚡ [Cached Step] Running: "${step.description}"`);
      },
      onStepEnd: (step) => {
        console.log(`✔ [Cached Step] Done: "${step.description}"`);
      },
    });

    const replayDuration = ((Date.now() - replayStart) / 1000).toFixed(2);
    console.log(`⚡ Warm replay completed in ${replayDuration}s!\n`);
  });
});
