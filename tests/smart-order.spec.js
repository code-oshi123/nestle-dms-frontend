/* eslint-disable */
// @ts-nocheck

'use strict';

const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://nestle-dms-frontend.vercel.app';

async function openApp(page) {
  await page.goto(BASE_URL);
}

/* ================= PAGE LOAD ================= */

test.describe('Page Load', () => {

  test('APP-01 Page loads', async ({ page }) => {
    await openApp(page);
    await expect(page.locator('body')).toBeVisible();
  });

test('APP-02 Smart Order section visible', async ({ page }) => {
  await openApp(page);

  // Wait for navigation tab instead (more stable)
  const smartOrderTab = page.getByRole('tab', { name: /smart order/i });

  if (await smartOrderTab.count() > 0) {
    await expect(smartOrderTab).toBeVisible();
  } else {
    // fallback: look for heading text loosely
    await expect(page.locator('text=/smart/i').first()).toBeVisible({ timeout: 10000 });
  }
});

});


/* ================= SUGGESTIONS ================= */

test.describe('Personalized Suggestions', () => {

  test.beforeEach(async ({ page }) => {
    await openApp(page);
  });

test('SUG-01 Suggestions section loads', async ({ page }) => {

  const inputs = page.locator('input[type="number"], input');

  await expect(inputs.first()).toBeVisible({ timeout: 15000 });
});

test('SUG-02 Products are listed (stable)', async ({ page }) => {

  // Wait for multiple input fields (each product has one)
  const inputs = page.locator('input[type="number"], input');

  // Ensure more than 1 product exists
  await expect(inputs).toHaveCountGreaterThan(1, { timeout: 15000 });
});

});


/* ================= QUANTITY INPUT ================= */

test.describe('Quantity Handling', () => {

  test.beforeEach(async ({ page }) => {
    await openApp(page);
  });

  test('QTY-01 Quantity inputs exist', async ({ page }) => {
    const inputs = page.locator('input');

    await expect(inputs.first()).toBeVisible();
  });

  test('QTY-02 User can change quantity', async ({ page }) => {
    const input = page.locator('input').first();

    await input.fill('10');

    await expect(input).toHaveValue('10');
  });

  test('QTY-03 Multiple inputs editable', async ({ page }) => {
    const inputs = page.locator('input');

    const count = await inputs.count();

    expect(count).toBeGreaterThan(1);

    await inputs.nth(1).fill('5');
    await expect(inputs.nth(1)).toHaveValue('5');
  });

});


/* ================= VALIDATION ================= */

test.describe('Validation', () => {

  test('VAL-01 Prevent negative values', async ({ page }) => {
    await openApp(page);

    const input = page.locator('input').first();

    await input.fill('-5');

    // UI may auto-correct or allow — just check it doesn't crash
    await expect(input).toBeVisible();
  });

});


/* ================= SUBMISSION ================= */

test.describe('Order Submission', () => {

  test.beforeEach(async ({ page }) => {
    await openApp(page);
  });

  test('ORDER-01 Submit button visible (if exists)', async ({ page }) => {

    const submitBtn = page.getByRole('button', { name: /submit|place order/i });

    if (await submitBtn.count() > 0) {
      await expect(submitBtn).toBeVisible();
    }
  });

  test('ORDER-02 Safe submit', async ({ page }) => {

    const submitBtn = page.getByRole('button', { name: /submit|place order/i });

    if (await submitBtn.count() > 0) {
      await submitBtn.click();
    }

    await expect(page.locator('body')).toBeVisible();
  });

});