/* eslint-disable */
// @ts-nocheck

'use strict';

const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://nestle-dms-frontend.vercel.app';

async function openApp(page) {
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
}

/* ================= LIVE TRACKING ================= */

test.describe('Live Vehicle Tracking functionality', () => {

  test('Verify Live Tracking UI (map OR empty state)', async ({ page }) => {

  await page.goto('https://nestle-dms-frontend.vercel.app');

  // 👉 CLICK DEMO USER (important based on your UI)
  await page.getByRole('button', { name: /CM Cargills Manager/i }).click();

  // wait for dashboard load
  await page.waitForLoadState('networkidle');

  // navigate to live tracking (adjust if tab exists)
  const liveTracking = page.getByRole('tab', { name: /live/i });
  if (await liveTracking.count() > 0) {
    await liveTracking.click();
  }

  // wait UI render
  await page.waitForTimeout(3000);

  const map = page.locator('canvas, iframe, .map, #map, [class*="map"]');
  const emptyState = page.locator('text=/no vehicle|no data|empty|not available/i');

  const hasMap = await map.first().isVisible().catch(() => false);
  const hasEmpty = await emptyState.first().isVisible().catch(() => false);

  expect(hasMap || hasEmpty).toBeTruthy();
});

});