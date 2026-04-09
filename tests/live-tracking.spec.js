// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://nestle-dms-frontend.vercel.app';

test.describe('Live Vehicle Tracking functionality', () => {

  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.locator('.qbtn').nth(1).click();

    // Wait for app to load
    await expect(page.locator('#app')).toBeVisible({ timeout: 10000 });
  });

  test('Verify Live Tracking UI (map OR empty state)', async ({ page }) => {

    // ✅ Step 1: Navigate properly to Live Tracking
    const liveTrackingTab = page.getByRole('button', { name: /live tracking/i });
    await expect(liveTrackingTab).toBeVisible();
    await liveTrackingTab.click();

    // ✅ Step 2: Verify page header (ensures correct screen)
    await expect(page.getByText(/Live Vehicle Tracking/i)).toBeVisible();

    // ✅ Step 3: Define possible UI states
    const focusButton = page.getByRole('button', { name: /focus/i }).first();
    const zoomInButton = page.getByRole('button', { name: /zoom in/i });
    const noDriversMessage = page.getByText(
      /No drivers currently in transit|No active deliveries/i
    );

    // ✅ Step 4: Wait until ANY valid UI appears
    await Promise.race([
      focusButton.waitFor({ state: 'visible' }).catch(() => {}),
      zoomInButton.waitFor({ state: 'visible' }).catch(() => {}),
      noDriversMessage.waitFor({ state: 'visible' }).catch(() => {})
    ]);

    // ✅ CASE 1: Drivers exist → Focus button
    if (await focusButton.isVisible().catch(() => false)) {

      await focusButton.click();

      // Wait for map controls (better than networkidle)
      await expect(zoomInButton).toBeVisible({ timeout: 10000 });

      await page.screenshot({
        path: 'screenshots/live-tracking-focus-clicked.png',
        fullPage: true
      });

    }

    // ✅ CASE 2: Map exists without focus interaction
    else if (await zoomInButton.isVisible().catch(() => false)) {

      await expect(zoomInButton).toBeVisible();

      await page.screenshot({
        path: 'screenshots/live-tracking-map.png',
        fullPage: true
      });

    }

    // ✅ CASE 3: No drivers → fallback message
    else {

      await expect(noDriversMessage).toBeVisible();

      await expect(noDriversMessage).toContainText(
        /No drivers currently in transit|No active deliveries/i
      );

      await page.screenshot({
        path: 'screenshots/live-tracking-empty-state.png',
        fullPage: true
      });

    }
  });
});