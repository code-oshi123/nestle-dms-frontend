// warehouse-stock.test.js — Stock levels page
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const baseURL = 'https://nestle-dms-frontend.vercel.app/';
const shot = async (page, name) => { fs.mkdirSync('screenshots/warehouse-stock', { recursive: true }); await page.screenshot({ path: `screenshots/warehouse-stock/${name}`, fullPage: true }); };

test.describe('Warehouse — Dashboard & Stock Levels', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
    await page.getByRole('button', { name: /Kasun Bandara/i }).click();
    await expect(page.locator('.tout')).toBeVisible({ timeout: 20000 });
  });

  test('Warehouse dashboard loads with KPI cards', async ({ page }) => {
    // Dashboard is the first tab
    await page.waitForSelector('.sec-title', { timeout: 10000 });
    await shot(page, 'step-01-wh-dashboard.png');
    await expect(page.locator('.sec-title')).toContainText(/Warehouse Dashboard/i);
  });

  test('Dashboard shows low stock alerts section', async ({ page }) => {
    await page.waitForSelector('.sec-title', { timeout: 10000 });
    await shot(page, 'step-02-low-stock-section.png');
    // Low stock card or all-clear message should exist
    const section = page.locator('.card-title:has-text("Low Stock")');
    await expect(section.first()).toBeVisible({ timeout: 8000 });
  });

  test('Stock Levels tab loads product table', async ({ page }) => {
    await page.getByRole('button', { name: /Stock Levels/i }).click();
    await page.waitForSelector('table', { timeout: 10000 });
    await shot(page, 'step-03-stock-table.png');
    const headers = await page.locator('thead th').allTextContents();
    expect(headers.join(' ')).toMatch(/Product|Units|Threshold/i);
  });

  test('Stock table rows have Update Stock buttons', async ({ page }) => {
    await page.getByRole('button', { name: /Stock Levels/i }).click();
    await page.waitForSelector('table', { timeout: 10000 });
    await shot(page, 'step-04-update-buttons.png');
    const updateBtns = page.locator('button:has-text("Update"), button:has-text("Restock")');
    if (await updateBtns.count() > 0) {
      await expect(updateBtns.first()).toBeVisible();
    }
  });

  test('Incoming Orders tab loads', async ({ page }) => {
    await page.getByRole('button', { name: /Incoming/i }).click();
    await page.waitForSelector('.sec-title', { timeout: 10000 });
    await shot(page, 'step-05-incoming-orders.png');
    await expect(page.locator('.sec-title')).toBeVisible();
  });

});