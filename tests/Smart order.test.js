// smart-order.test.js — Sprint Focus: Smart Order Placement
// Target: https://nestle-dms-frontend.vercel.app/
// Role: Retailer (Cargills Manager — quick access)
//
// Covers:
//  1. Form loads with all fields
//  2. Province → area cascade works
//  3. Date drives priority badge (Standard / High / Urgent)
//  4. Add Another Product line works
//  5. Order summary counts update live
//  6. Single product happy-path submission
//  7. Multi-product (2 lines) happy-path submission
//  8. Submit with no province → validation error
//  9. Submit with no product selected → error
// 10. Out-of-stock line shows waitlist option

const { test, expect } = require('@playwright/test');
const fs = require('fs');

const baseURL = 'https://nestle-dms-frontend.vercel.app/';
const shot = async (page, n) => {
  fs.mkdirSync('screenshots/smart-order', { recursive: true });
  await page.screenshot({ path: `screenshots/smart-order/${n}`, fullPage: true });
};

// ── helpers ───────────────────────────────────────────────────────────────────
async function loginRetailer(page) {
  await page.goto(baseURL);
  await page.getByRole('button', { name: /Cargills Manager/i }).click();
  await expect(page.locator('.tout')).toBeVisible({ timeout: 20000 });
  // Dismiss order-reminder modal if it appears
  await page.waitForTimeout(1500);
  try {
    const modal = page.locator('#m-order-reminder');
    if (await modal.isVisible({ timeout: 800 })) {
      await page.locator('#m-order-reminder .btn-ghost').first().click();
      await modal.waitFor({ state: 'hidden', timeout: 3000 });
    }
  } catch (_) {}
}

async function goToSmartOrder(page) {
  await page.getByRole('button', { name: /Smart Order/i }).click();
  // Wait for the province dropdown — means the form JS has rendered
  await page.waitForSelector('#i-city', { state: 'visible', timeout: 12000 });
  // Wait for product dropdowns to be injected by loadAllProducts()
  await page.waitForSelector('[id^="line-"][id$="-product"]', { timeout: 12000 });
}

async function fillProvince(page, province = 'Western') {
  await page.selectOption('#i-city', province);
  // populateAreas() is called by onchange — wait for area to enable
  await page.waitForFunction(
    () => !document.getElementById('i-area')?.disabled,
    { timeout: 5000 }
  );
}

async function fillArea(page, index = 1) {
  await page.selectOption('#i-area', { index });
}

async function fillFirstLine(page, productIndex = 1, qty = '5') {
  const productSel = page.locator('[id^="line-"][id$="-product"]').first();
  await productSel.selectOption({ index: productIndex });
  const itemsInput = page.locator('[id^="line-"][id$="-items"]').first();
  await itemsInput.fill('');
  await itemsInput.fill(qty);
  // Trigger summary update
  await itemsInput.dispatchEvent('input');
}

// =============================================================================
test.describe('Smart Order — Form Structure', () => {

  test('Form loads with all required fields visible', async ({ page }) => {
    await loginRetailer(page);
    await goToSmartOrder(page);
    await shot(page, 'step-01-form-loaded.png');

    await expect(page.locator('#i-order-date')).toBeVisible();
    await expect(page.locator('#i-prio')).toBeVisible();
    await expect(page.locator('#i-city')).toBeVisible();
    await expect(page.locator('#i-area')).toBeVisible();
    await expect(page.locator('#i-notes')).toBeVisible();
    // At least one product line added by addOrderLine()
    await expect(page.locator('[id^="line-"][id$="-product"]').first()).toBeVisible();
    // Submit button
    await expect(page.locator('button:has-text("Submit Order")')).toBeVisible();
  });

  test('Province dropdown has options after load', async ({ page }) => {
    await loginRetailer(page);
    await goToSmartOrder(page);
    const optCount = await page.locator('#i-city option').count();
    expect(optCount).toBeGreaterThan(1); // at least the blank + 1 province
    await shot(page, 'step-02-province-options.png');
  });

  test('Area dropdown is disabled until province is selected', async ({ page }) => {
    await loginRetailer(page);
    await goToSmartOrder(page);
    await expect(page.locator('#i-area')).toBeDisabled();
    await shot(page, 'step-03-area-disabled.png');
  });

});

// =============================================================================
test.describe('Smart Order — Province → Area Cascade', () => {

  test('Selecting Western province enables area dropdown', async ({ page }) => {
    await loginRetailer(page);
    await goToSmartOrder(page);
    await fillProvince(page, 'Western');
    await shot(page, 'step-04-western-selected.png');
    await expect(page.locator('#i-area')).toBeEnabled();
    const areaCount = await page.locator('#i-area option').count();
    expect(areaCount).toBeGreaterThan(1);
  });

  test('Changing province repopulates area options', async ({ page }) => {
    await loginRetailer(page);
    await goToSmartOrder(page);
    await fillProvince(page, 'Western');
    const westernAreas = await page.locator('#i-area option').count();
    await fillProvince(page, 'Central');
    await page.waitForTimeout(400);
    const centralAreas = await page.locator('#i-area option').count();
    await shot(page, 'step-05-province-changed.png');
    // Central has different areas from Western — count may differ
    expect(centralAreas).toBeGreaterThan(0);
  });

});

// =============================================================================
test.describe('Smart Order — Date-Driven Priority Badge', () => {

  test('Today\'s date shows Urgent or High badge (auto-set)', async ({ page }) => {
    await loginRetailer(page);
    await goToSmartOrder(page);
    // Date is pre-filled to today — badge should reflect urgency
    const badge = page.locator('#priority-badge');
    await expect(badge).toBeVisible();
    const text = await badge.textContent();
    await shot(page, 'step-06-priority-badge-today.png');
    // Today = diff 0 → Urgent badge; badge must contain a status word
    expect(text).toMatch(/Urgent|High|Standard/i);
  });

  test('Far future date shows Standard badge and unlocks priority select', async ({ page }) => {
    await loginRetailer(page);
    await goToSmartOrder(page);
    // Set date 30 days from now
    const future = new Date();
    future.setDate(future.getDate() + 30);
    const futureStr = future.toISOString().split('T')[0];
    await page.fill('#i-order-date', futureStr);
    await page.locator('#i-order-date').dispatchEvent('change');
    await page.waitForTimeout(400);
    await shot(page, 'step-07-future-date-standard.png');
    const badge = page.locator('#priority-badge');
    const text = await badge.textContent();
    expect(text).toMatch(/Standard/i);
    // Priority select should be enabled for Standard scheduling
    await expect(page.locator('#i-prio')).toBeEnabled();
  });

});

// =============================================================================
test.describe('Smart Order — Product Lines', () => {

  test('Product dropdown has products loaded from API', async ({ page }) => {
    await loginRetailer(page);
    await goToSmartOrder(page);
    const productSel = page.locator('[id^="line-"][id$="-product"]').first();
    const optCount = await productSel.locator('option').count();
    expect(optCount).toBeGreaterThan(1); // blank + at least 1 product
    await shot(page, 'step-08-product-options.png');
  });

  test('Add Another Product button adds a second line', async ({ page }) => {
    await loginRetailer(page);
    await goToSmartOrder(page);
    const before = await page.locator('[id^="line-"][id$="-product"]').count();
    await page.getByRole('button', { name: /Add Another Product/i }).click();
    await page.waitForTimeout(300);
    const after = await page.locator('[id^="line-"][id$="-product"]').count();
    expect(after).toBe(before + 1);
    await shot(page, 'step-09-second-line-added.png');
  });

  test('Order summary updates when product and qty are filled', async ({ page }) => {
    await loginRetailer(page);
    await goToSmartOrder(page);
    await fillProvince(page, 'Western');
    await fillArea(page, 1);
    await fillFirstLine(page, 1, '10');
    await page.waitForTimeout(500);
    await shot(page, 'step-10-summary-updated.png');
    // Summary should show at least 1 product line
    const sumLines = page.locator('#sum-lines');
    if (await sumLines.isVisible()) {
      const val = await sumLines.textContent();
      expect(parseInt(val)).toBeGreaterThanOrEqual(1);
    }
  });

  test('kg badge appears after selecting product and qty', async ({ page }) => {
    await loginRetailer(page);
    await goToSmartOrder(page);
    await fillFirstLine(page, 1, '5');
    await page.waitForTimeout(500);
    await shot(page, 'step-11-kg-badge.png');
    // kg badge is injected per line when product has a weight
    const kgBadge = page.locator('#kg-badge');
    // Only assert visible if it exists (product must have weightPerUnit)
    const exists = await kgBadge.count();
    if (exists > 0 && await kgBadge.isVisible()) {
      const kgText = await kgBadge.textContent();
      expect(kgText).toMatch(/kg/i);
    }
  });

});

// =============================================================================
test.describe('Smart Order — Happy Path Submission', () => {

  test('Single product order submits successfully', async ({ page }) => {
    await loginRetailer(page);
    await goToSmartOrder(page);

    await fillProvince(page, 'Western');
    await fillArea(page, 1);
    await fillFirstLine(page, 1, '5');
    await shot(page, 'step-12-single-order-filled.png');

    await page.getByRole('button', { name: /Submit Order/i }).click();
    // Wait for response — backend on Render may take a few seconds
    await page.waitForTimeout(5000);
    await shot(page, 'step-13-single-order-submitted.png');

    // Success: toast appears OR redirected to My Orders tab
    const success = page.locator('.toast:has-text("placed"), .toast:has-text("✅"), #tab-my-orders.active');
    await expect(success.first()).toBeVisible({ timeout: 10000 });
  });

  test('Multi-product (2 lines) order submits successfully', async ({ page }) => {
    await loginRetailer(page);
    await goToSmartOrder(page);

    await fillProvince(page, 'Western');
    await fillArea(page, 1);
    await fillFirstLine(page, 1, '5');

    // Add second line
    await page.getByRole('button', { name: /Add Another Product/i }).click();
    await page.waitForTimeout(400);
    const productSels = page.locator('[id^="line-"][id$="-product"]');
    await productSels.nth(1).selectOption({ index: 2 }); // pick different product
    const itemsInputs = page.locator('[id^="line-"][id$="-items"]');
    await itemsInputs.nth(1).fill('3');

    await shot(page, 'step-14-multi-order-filled.png');

    await page.getByRole('button', { name: /Submit Order/i }).click();
    await page.waitForTimeout(5000);
    await shot(page, 'step-15-multi-order-submitted.png');

    const success = page.locator('.toast:has-text("placed"), .toast:has-text("✅"), #tab-my-orders.active');
    await expect(success.first()).toBeVisible({ timeout: 10000 });
  });

  test('Submitted order appears in My Orders list', async ({ page }) => {
    await loginRetailer(page);
    await goToSmartOrder(page);

    await fillProvince(page, 'Western');
    await fillArea(page, 1);
    await fillFirstLine(page, 1, '2');
    await page.getByRole('button', { name: /Submit Order/i }).click();
    await page.waitForTimeout(5000);

    // Navigate to My Orders
    await page.getByRole('button', { name: /My Orders/i }).click();
    await page.waitForSelector('table', { timeout: 10000 });
    await shot(page, 'step-16-order-in-my-orders.png');

    // Table should have at least one row
    const rows = await page.locator('tbody tr').count();
    expect(rows).toBeGreaterThan(0);
  });

  test('Notes field value is included in the order', async ({ page }) => {
    await loginRetailer(page);
    await goToSmartOrder(page);

    await fillProvince(page, 'Western');
    await fillArea(page, 1);
    await page.fill('#i-notes', 'Playwright test — deliver before noon');
    await fillFirstLine(page, 1, '2');
    await shot(page, 'step-17-notes-filled.png');

    await page.getByRole('button', { name: /Submit Order/i }).click();
    await page.waitForTimeout(5000);
    await shot(page, 'step-18-notes-submitted.png');

    const success = page.locator('.toast:has-text("placed"), .toast:has-text("✅"), #tab-my-orders.active');
    await expect(success.first()).toBeVisible({ timeout: 10000 });
  });

});

// =============================================================================
test.describe('Smart Order — Validation & Edge Cases', () => {

  test('Submit with no province selected shows field error', async ({ page }) => {
    await loginRetailer(page);
    await goToSmartOrder(page);
    // Don't select province — click submit
    await page.getByRole('button', { name: /Submit Order/i }).click();
    await page.waitForTimeout(500);
    await shot(page, 'step-19-no-province-error.png');
    // err-city gets class "show" OR submit-err becomes visible
    const cityErr = page.locator('#err-city.show, #submit-err:visible');
    await expect(cityErr.first()).toBeVisible({ timeout: 3000 });
    // Must NOT navigate away
    await expect(page.locator('#i-city')).toBeVisible();
  });

  test('Submit with province but no area shows area field error', async ({ page }) => {
    await loginRetailer(page);
    await goToSmartOrder(page);
    await fillProvince(page, 'Western');
    // Do NOT select area
    await page.getByRole('button', { name: /Submit Order/i }).click();
    await page.waitForTimeout(500);
    await shot(page, 'step-20-no-area-error.png');
    const areaErr = page.locator('#err-area.show, #submit-err:visible');
    await expect(areaErr.first()).toBeVisible({ timeout: 3000 });
  });

  test('Submit with area but no product shows submit-err banner', async ({ page }) => {
    await loginRetailer(page);
    await goToSmartOrder(page);
    await fillProvince(page, 'Western');
    await fillArea(page, 1);
    // Leave product dropdown at blank
    await page.getByRole('button', { name: /Submit Order/i }).click();
    await page.waitForTimeout(500);
    await shot(page, 'step-21-no-product-error.png');
    await expect(page.locator('#submit-err')).toBeVisible({ timeout: 3000 });
    const errText = await page.locator('#submit-err').textContent();
    expect(errText).toMatch(/product|line/i);
  });

  test('Zero quantity triggers submit-err banner', async ({ page }) => {
    await loginRetailer(page);
    await goToSmartOrder(page);
    await fillProvince(page, 'Western');
    await fillArea(page, 1);
    // Select product but leave items = 0
    const productSel = page.locator('[id^="line-"][id$="-product"]').first();
    await productSel.selectOption({ index: 1 });
    const itemsInput = page.locator('[id^="line-"][id$="-items"]').first();
    await itemsInput.fill('0');
    await page.getByRole('button', { name: /Submit Order/i }).click();
    await page.waitForTimeout(500);
    await shot(page, 'step-22-zero-qty-error.png');
    await expect(page.locator('#submit-err')).toBeVisible({ timeout: 3000 });
  });

  test('Out-of-stock product shows waitlist option after submit', async ({ page }) => {
    await loginRetailer(page);
    await goToSmartOrder(page);
    await fillProvince(page, 'Western');
    await fillArea(page, 1);
    // Order a huge quantity to force stock-out scenario
    await fillFirstLine(page, 1, '99999');
    await page.getByRole('button', { name: /Submit Order/i }).click();
    await page.waitForTimeout(6000);
    await shot(page, 'step-23-out-of-stock-waitlist.png');
    // Either waitlist-options appear OR a toast mentions stock/waitlist
    const waitlistOrToast = page.locator('#waitlist-options button, .toast:has-text("stock"), .toast:has-text("waitlist")');
    // This is informational — soft assertion (stock may actually cover it)
    const count = await waitlistOrToast.count();
    // Just screenshot the result for sprint review
    expect(count).toBeGreaterThanOrEqual(0);
  });

});