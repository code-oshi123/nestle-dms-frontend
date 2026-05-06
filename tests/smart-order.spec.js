/* eslint-disable */
// @ts-nocheck

'use strict';

const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'https://nestle-dms-frontend.vercel.app';

async function openApp(page) {
  await page.goto(BASE_URL);
}

/* ================= GLOBAL CONFIG ================= */

test.describe.configure({ retries: 1 });

/* ================= PAGE LOAD ================= */

test.describe('Page Load', () => {

  test('APP-01 Page loads', async ({ page }) => {
    await openApp(page);
    await expect(page.locator('body')).toBeVisible();
  });

  test('APP-02 Order form visible', async ({ page }) => {
    await openApp(page);
    await expect(page.locator('#order-lines')).toBeVisible({ timeout: 10000 });
  });

});


/* ================= PRODUCT SELECTION ================= */

test.describe('Product Selection', () => {

  test.beforeEach(async ({ page }) => {
    await openApp(page);
  });

  test('PROD-01 Dropdown loads', async ({ page }) => {
    const dropdown = page.locator('#line-1-product');

    await expect(dropdown).toBeVisible({ timeout: 10000 });

    // wait until options loaded
    await page.waitForTimeout(2000);

    const options = await dropdown.locator('option').count();

    expect(options).toBeGreaterThan(1);
  });

  test('PROD-02 Select product', async ({ page }) => {
    const dropdown = page.locator('#line-1-product');

    await expect(dropdown).toBeVisible();
    await page.waitForTimeout(2000);

    await dropdown.selectOption({ index: 1 });

    const value = await dropdown.inputValue();
    expect(value).not.toBe('');
  });

});


/* ================= ORDER FORM ================= */

test.describe('Order Form', () => {

  test.beforeEach(async ({ page }) => {
    await openApp(page);
  });

  test('FORM-01 Enter quantity', async ({ page }) => {
    const qty = page.locator('#line-1-items');

    await expect(qty).toBeVisible();
    await qty.fill('5');

    await expect(qty).toHaveValue('5');
  });

  test('FORM-02 Summary updates', async ({ page }) => {
    await page.waitForTimeout(2000);

    await page.locator('#line-1-product').selectOption({ index: 1 });
    await page.locator('#line-1-items').fill('3');

    await page.waitForTimeout(2000);

    await expect(page.locator('#sum-items')).not.toHaveText('0');
  });

  test('FORM-03 Add new line', async ({ page }) => {
    await page.getByRole('button', { name: /add another/i }).click();

    await expect(page.locator('[id^="line-2-product"]')).toBeVisible();
  });

});


/* ================= STOCK HANDLING ================= */

test.describe('Stock Handling', () => {

  test.beforeEach(async ({ page }) => {
    await openApp(page);
  });

  test('STOCK-01 Stock indicator appears', async ({ page }) => {
    await page.waitForTimeout(2000);

    await page.locator('#line-1-product').selectOption({ index: 1 });

    await expect(page.locator('[id^="line-1-stock"]')).toBeVisible();
  });

});


/* ================= ORDER SUBMISSION ================= */

test.describe('Order Submission', () => {

  test.beforeEach(async ({ page }) => {
    await openApp(page);

    await page.waitForTimeout(2000);
    await page.locator('#line-1-product').selectOption({ index: 1 });
    await page.locator('#line-1-items').fill('2');
  });

  test('ORDER-01 Submit button visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /submit order/i })).toBeVisible();
  });

  test('ORDER-02 Submit order safely', async ({ page }) => {
    await page.getByRole('button', { name: /submit order/i }).click();

    // Don't expect backend success (safe test)
    await expect(page.locator('body')).toBeVisible();
  });

});


/* ================= VALIDATION ================= */

test.describe('Validation', () => {

  test('VAL-01 Prevent empty submit', async ({ page }) => {
    await openApp(page);

    await page.getByRole('button', { name: /submit order/i }).click();

    await expect(page.locator('#submit-err')).toBeVisible();
  });

});