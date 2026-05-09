// distributor-routes.test.js — Driver views routes & updates status
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const baseURL = 'https://nestle-dms-frontend.vercel.app/';
const shot = async (page, name) => { fs.mkdirSync('screenshots/distributor-routes', { recursive: true }); await page.screenshot({ path: `screenshots/distributor-routes/${name}`, fullPage: true }); };

test.describe('Distributor — My Routes & Update Status', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
    await page.getByRole('button', { name: /Kumara Silva/i }).click();
    await expect(page.locator('.tout')).toBeVisible({ timeout: 20000 });
  });

  test('My Routes tab loads', async ({ page }) => {
    await page.getByRole('button', { name: /My Routes/i }).click();
    await page.waitForSelector('.sec-title', { timeout: 10000 });
    await shot(page, 'step-01-my-routes.png');
    await expect(page.locator('.sec-title')).toBeVisible();
  });

  test('Routes page shows assigned deliveries or empty state', async ({ page }) => {
    await page.getByRole('button', { name: /My Routes/i }).click();
    await page.waitForSelector('.sec-title', { timeout: 10000 });
    await shot(page, 'step-02-routes-content.png');
    const hasContent = await page.locator('table, .empty, .card').first().isVisible();
    expect(hasContent).toBe(true);
  });

  test('Update Status tab loads', async ({ page }) => {
    await page.getByRole('button', { name: /Update Status/i }).click();
    await page.waitForSelector('.sec-title', { timeout: 10000 });
    await shot(page, 'step-03-update-status.png');
    await expect(page.locator('.sec-title')).toBeVisible();
  });

  test('Update Status shows progress bar or delivery cards', async ({ page }) => {
    await page.getByRole('button', { name: /Update Status/i }).click();
    await page.waitForSelector('.sec-title', { timeout: 10000 });
    await shot(page, 'step-04-delivery-cards.png');
    // Progress bar, delivery cards, or empty state — all valid
    const hasAny = await page.locator('.card, .empty, table').first().isVisible();
    expect(hasAny).toBe(true);
  });

  test('Distributor does NOT see Smart Order or Stock Levels tabs', async ({ page }) => {
    const tabs = await page.locator('.tab').allTextContents();
    const joined = tabs.join(' ');
    expect(joined).not.toContain('Smart Order');
    expect(joined).not.toContain('Stock Levels');
    await shot(page, 'step-05-nav-isolation.png');
  });

});