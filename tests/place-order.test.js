// place-order.test.js — Retailer places a smart order
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const baseURL = 'https://nestle-dms-frontend.vercel.app/';
const shot = async (page, name) => { fs.mkdirSync('screenshots/place-order', { recursive: true }); await page.screenshot({ path: `screenshots/place-order/${name}`, fullPage: true }); };

test.describe('Place Order — Retailer', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
    await page.getByRole('button', { name: /Cargills Manager/i }).click();
    await expect(page.locator('.tout')).toBeVisible({ timeout: 20000 });
  });

  test('Smart Order tab loads with form fields', async ({ page }) => {
    await page.getByRole('button', { name: /Smart Order/i }).click();
    await expect(page.locator('#i-city')).toBeVisible({ timeout: 10000 });
    await shot(page, 'step-01-form-loaded.png');
    await expect(page.locator('#i-prio')).toBeVisible();
    await expect(page.locator('#i-order-date')).toBeVisible();
  });

  test('Selecting province populates city/area dropdown', async ({ page }) => {
    await page.getByRole('button', { name: /Smart Order/i }).click();
    await page.waitForSelector('#i-city', { state: 'visible' });
    await page.selectOption('#i-city', { index: 1 }); // pick first province
    await page.waitForTimeout(500);
    await shot(page, 'step-02-province-selected.png');
    const areaDisabled = await page.locator('#i-area').isDisabled();
    expect(areaDisabled).toBe(false);
  });

  test('Full happy-path order submission', async ({ page }) => {
    await page.getByRole('button', { name: /Smart Order/i }).click();
    await page.waitForSelector('#i-city', { state: 'visible', timeout: 10000 });

    // Fill province & area
    await page.selectOption('#i-city', 'Western');
    await page.waitForTimeout(600);
    await page.selectOption('#i-area', { index: 1 });

    // Wait for product dropdown to load
    await page.waitForSelector('[id^="line-"][id$="-product"]', { timeout: 10000 });
    const productSel = page.locator('[id^="line-"][id$="-product"]').first();
    await productSel.selectOption({ index: 1 });

    // Fill quantity
    const itemsInput = page.locator('[id^="line-"][id$="-items"]').first();
    await itemsInput.fill('10');

    await shot(page, 'step-03-form-filled.png');

    // Submit
    await page.getByRole('button', { name: /Submit Order/i }).click();
    await page.waitForTimeout(4000);
    await shot(page, 'step-04-after-submit.png');

    // Expect toast or redirect to My Orders
    const toastOrOrders = page.locator('.toast, #tab-my-orders.active');
    await expect(toastOrOrders.first()).toBeVisible({ timeout: 8000 });
  });

  test('Submitting without province shows validation error', async ({ page }) => {
    await page.getByRole('button', { name: /Smart Order/i }).click();
    await page.waitForSelector('#i-city', { state: 'visible' });
    await page.getByRole('button', { name: /Submit Order/i }).click();
    await shot(page, 'step-05-validation-error.png');
    // Either field error or submit-err banner
    const errVisible = await page.locator('#err-city.show, #submit-err').first().isVisible();
    expect(errVisible).toBe(true);
  });

});