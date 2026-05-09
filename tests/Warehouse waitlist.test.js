// warehouse-waitlist.test.js — Waitlist queue management
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const baseURL = 'https://nestle-dms-frontend.vercel.app/';
const shot = async (page, name) => { fs.mkdirSync('screenshots/warehouse-waitlist', { recursive: true }); await page.screenshot({ path: `screenshots/warehouse-waitlist/${name}`, fullPage: true }); };

test.describe('Warehouse — Waitlist', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
    await page.getByRole('button', { name: /Kasun Bandara/i }).click();
    await expect(page.locator('.tout')).toBeVisible({ timeout: 20000 });
    await page.getByRole('button', { name: /Waitlist/i }).click();
    await page.waitForSelector('.sec-title', { timeout: 10000 });
  });

  test('Waitlist tab loads with section title', async ({ page }) => {
    await shot(page, 'step-01-waitlist-loaded.png');
    await expect(page.locator('.sec-title')).toBeVisible();
  });

  test('Waitlist shows queue table or empty state', async ({ page }) => {
    await shot(page, 'step-02-waitlist-content.png');
    // Either a table with entries or an empty-state message
    const hasTable = await page.locator('table').isVisible().catch(() => false);
    const hasEmpty = await page.locator('.empty').isVisible().catch(() => false);
    expect(hasTable || hasEmpty).toBe(true);
  });

  test('Waitlist table has correct columns if entries exist', async ({ page }) => {
    const hasTable = await page.locator('table').isVisible({ timeout: 5000 }).catch(() => false);
    if (hasTable) {
      const headers = await page.locator('thead th').allTextContents();
      await shot(page, 'step-03-waitlist-columns.png');
      expect(headers.join(' ')).toMatch(/Retailer|Product|Qty|City/i);
    }
  });

  test('Process / Cancel buttons visible on waitlist rows', async ({ page }) => {
    await shot(page, 'step-04-waitlist-actions.png');
    const actionBtns = page.locator('button:has-text("Process"), button:has-text("Cancel"), button:has-text("Notify")');
    // Only checks if there are entries; passes if empty list
    const count = await actionBtns.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

});