// order-team-dashboard.test.js — Order Team dashboard & deliveries
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const baseURL = 'https://nestle-dms-frontend.vercel.app/';
const shot = async (page, name) => { fs.mkdirSync('screenshots/order-team-dashboard', { recursive: true }); await page.screenshot({ path: `screenshots/order-team-dashboard/${name}`, fullPage: true }); };

test.describe('Order Team Dashboard', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
    await page.getByRole('button', { name: /Nuwan Dissanayake/i }).click();
    await expect(page.locator('.tout')).toBeVisible({ timeout: 20000 });
  });

  test('Dashboard tab loads with KPI cards', async ({ page }) => {
    // Dashboard is the first tab — loaded automatically
    await page.waitForSelector('.kpi, [style*="font-size:26px"]', { timeout: 10000 });
    await shot(page, 'step-01-dashboard-loaded.png');
    // At least one KPI-style number visible
    const kpis = page.locator('.kpi');
    if (await kpis.count() > 0) await expect(kpis.first()).toBeVisible();
  });

  test('All Deliveries tab shows table', async ({ page }) => {
    await page.getByRole('button', { name: /All Deliveries/i }).click();
    await page.waitForSelector('table', { timeout: 10000 });
    await shot(page, 'step-02-deliveries-table.png');
    await expect(page.locator('table')).toBeVisible();
    const headers = await page.locator('thead th').allTextContents();
    expect(headers.join(' ')).toMatch(/Retailer|City|Status/i);
  });

  test('Retailers tab shows retailer list', async ({ page }) => {
    await page.getByRole('button', { name: /Retailers/i }).click();
    await page.waitForSelector('.sec-title', { timeout: 10000 });
    await shot(page, 'step-03-retailers-tab.png');
    await expect(page.locator('.sec-title')).toBeVisible();
  });

  test('Add Retailer button opens modal', async ({ page }) => {
    await page.getByRole('button', { name: /Retailers/i }).click();
    await page.waitForSelector('button:has-text("Add Retailer")', { timeout: 8000 });
    await page.getByRole('button', { name: /Add Retailer/i }).click();
    await shot(page, 'step-04-add-retailer-modal.png');
    await expect(page.locator('#m-add-retailer')).toBeVisible({ timeout: 5000 });
    await page.locator('#m-add-retailer .btn-ghost').click(); // close
  });

});