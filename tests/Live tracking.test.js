// live-tracking.test.js — Live map loads and shows markers
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const baseURL = 'https://nestle-dms-frontend.vercel.app/';
const shot = async (page, name) => { fs.mkdirSync('screenshots/live-tracking', { recursive: true }); await page.screenshot({ path: `screenshots/live-tracking/${name}`, fullPage: true }); };

test.describe('Live Tracking — map loads for each role', () => {

  test('Retailer can open Live Tracking map', async ({ page }) => {
    await page.goto(baseURL);
    await page.getByRole('button', { name: /Cargills Manager/i }).click();
    await expect(page.locator('.tout')).toBeVisible({ timeout: 20000 });
    await page.getByRole('button', { name: /Live Tracking/i }).click();
    await page.waitForSelector('#live-map', { timeout: 15000 });
    await shot(page, 'step-01-retailer-map.png');
    await expect(page.locator('#live-map')).toBeVisible();
    await expect(page.locator('.track-badge')).toBeVisible();
  });

  test('Order Team can open Live Tracking map', async ({ page }) => {
    await page.goto(baseURL);
    await page.getByRole('button', { name: /Nuwan Dissanayake/i }).click();
    await expect(page.locator('.tout')).toBeVisible({ timeout: 20000 });
    await page.getByRole('button', { name: /Live Tracking/i }).click();
    await page.waitForSelector('#live-map', { timeout: 15000 });
    await shot(page, 'step-02-orderteam-map.png');
    await expect(page.locator('#live-map')).toBeVisible();
  });

  test('Distributor can open Live Tracking map', async ({ page }) => {
    await page.goto(baseURL);
    await page.getByRole('button', { name: /Kumara Silva/i }).click();
    await expect(page.locator('.tout')).toBeVisible({ timeout: 20000 });
    await page.getByRole('button', { name: /Live Tracking/i }).click();
    await page.waitForSelector('#live-map', { timeout: 15000 });
    await shot(page, 'step-03-distributor-map.png');
    await expect(page.locator('#live-map')).toBeVisible();
  });

  test('Map container has correct dimensions (not collapsed)', async ({ page }) => {
    await page.goto(baseURL);
    await page.getByRole('button', { name: /Cargills Manager/i }).click();
    await expect(page.locator('.tout')).toBeVisible({ timeout: 20000 });
    await page.getByRole('button', { name: /Live Tracking/i }).click();
    await page.waitForSelector('#live-map', { timeout: 15000 });
    await shot(page, 'step-04-map-dimensions.png');
    const box = await page.locator('.map-container').boundingBox();
    expect(box.height).toBeGreaterThan(200);
    expect(box.width).toBeGreaterThan(200);
  });

  test('LIVE badge is visible on map page', async ({ page }) => {
    await page.goto(baseURL);
    await page.getByRole('button', { name: /Cargills Manager/i }).click();
    await expect(page.locator('.tout')).toBeVisible({ timeout: 20000 });
    await page.getByRole('button', { name: /Live Tracking/i }).click();
    await page.waitForSelector('.track-badge', { timeout: 15000 });
    await shot(page, 'step-05-live-badge.png');
    await expect(page.locator('.track-badge')).toContainText(/LIVE/i);
  });

});