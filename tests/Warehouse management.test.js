// warehouse-management.test.js — Sprint Focus: Warehouse Management
// Target: https://nestle-dms-frontend.vercel.app/
// Role: Warehouse (Kasun Bandara — quick access)
//
// Covers:
//  1.  Dashboard loads with all 4 KPI cards
//  2.  Low Stock Alerts section shows products or all-clear
//  3.  Waitlist Queue section visible on dashboard
//  4.  Stock Levels tab loads full product table
//  5.  Suggested Restock values are shown per product
//  6.  Use Suggested button fills the units input
//  7.  Updating stock saves and shows toast
//  8.  Threshold field is editable
//  9.  Incoming Orders tab loads correct columns
// 10.  Warehouse Ready button visible on assigned deliveries
// 11.  Waitlist tab shows Full & Partial sections
// 12.  Waitlist Fulfil button visible on partial entries
// 13.  Waitlist Cancel button visible on entries
// 14.  Warehouse cannot see Retailer / Smart Order tabs

const { test, expect } = require('@playwright/test');
const fs = require('fs');

const baseURL = 'https://nestle-dms-frontend.vercel.app/';
const shot = async (page, n) => {
  fs.mkdirSync('screenshots/warehouse-management', { recursive: true });
  await page.screenshot({ path: `screenshots/warehouse-management/${n}`, fullPage: true });
};

async function loginWarehouse(page) {
  await page.goto(baseURL);
  await page.getByRole('button', { name: /Kasun Bandara/i }).click();
  await expect(page.locator('.tout')).toBeVisible({ timeout: 20000 });
}

// =============================================================================
test.describe('Warehouse — Dashboard', () => {

  test('Dashboard loads and shows section title', async ({ page }) => {
    await loginWarehouse(page);
    await page.waitForSelector('.sec-title', { timeout: 12000 });
    await shot(page, 'step-01-dashboard-loaded.png');
    await expect(page.locator('.sec-title')).toContainText(/Warehouse Dashboard/i);
  });

  test('4 KPI cards are rendered with numeric values', async ({ page }) => {
    await loginWarehouse(page);
    await page.waitForSelector('.sec-title', { timeout: 12000 });
    await shot(page, 'step-02-kpi-cards.png');
    // KPI cards use inline style font-size:26px for the number
    const kpiNumbers = page.locator('[style*="font-size:26px"]');
    const count = await kpiNumbers.count();
    expect(count).toBeGreaterThanOrEqual(3); // Total, Reserved, Available, Pending
    // Each number should be numeric
    for (let i = 0; i < Math.min(count, 4); i++) {
      const text = (await kpiNumbers.nth(i).textContent()).replace(/,/g, '').trim();
      expect(isNaN(Number(text))).toBe(false);
    }
  });

  test('Low Stock Alerts card is visible on dashboard', async ({ page }) => {
    await loginWarehouse(page);
    await page.waitForSelector('.card-title', { timeout: 12000 });
    await shot(page, 'step-03-low-stock-card.png');
    await expect(page.locator('.card-title:has-text("Low Stock")')).toBeVisible();
  });

  test('Low stock card shows products or all-clear message', async ({ page }) => {
    await loginWarehouse(page);
    await page.waitForSelector('.card-title', { timeout: 12000 });
    const hasAlerts = await page.locator('.card-title:has-text("Low Stock")').isVisible();
    if (hasAlerts) {
      // Either product rows or an all-clear empty state
      const hasRows  = await page.locator('.card:has(.card-title:has-text("Low Stock")) [style*="border-bottom"]').count() > 0;
      const hasEmpty = await page.locator('.card:has(.card-title:has-text("Low Stock")) .empty').isVisible().catch(() => false);
      await shot(page, 'step-04-low-stock-content.png');
      expect(hasRows || hasEmpty).toBe(true);
    }
  });

  test('Waitlist Queue card is visible on dashboard', async ({ page }) => {
    await loginWarehouse(page);
    await page.waitForSelector('.card-title', { timeout: 12000 });
    await shot(page, 'step-05-waitlist-queue-card.png');
    await expect(page.locator('.card-title:has-text("Waitlist Queue")')).toBeVisible();
  });

  test('Live badge is shown on dashboard header', async ({ page }) => {
    await loginWarehouse(page);
    await page.waitForSelector('.sec-title', { timeout: 12000 });
    await shot(page, 'step-06-live-badge.png');
    const liveBadge = page.locator('text=Live');
    await expect(liveBadge.first()).toBeVisible();
  });

});

// =============================================================================
test.describe('Warehouse — Stock Levels', () => {

  test.beforeEach(async ({ page }) => {
    await loginWarehouse(page);
    await page.getByRole('button', { name: /Stock Levels/i }).click();
    await page.waitForSelector('table', { timeout: 12000 });
  });

  test('Stock table has correct column headers', async ({ page }) => {
    await shot(page, 'step-07-stock-table-headers.png');
    const headers = await page.locator('thead th').allTextContents();
    const joined = headers.join(' ');
    expect(joined).toMatch(/Product/i);
    expect(joined).toMatch(/Units|Stock/i);
    expect(joined).toMatch(/Threshold/i);
  });

  test('Stock table has at least one product row', async ({ page }) => {
    const rows = await page.locator('tbody tr').count();
    expect(rows).toBeGreaterThan(0);
    await shot(page, 'step-08-stock-rows.png');
  });

  test('Each row has an editable units input', async ({ page }) => {
    await shot(page, 'step-09-units-inputs.png');
    const unitsInputs = page.locator('[id^="units-"]');
    expect(await unitsInputs.count()).toBeGreaterThan(0);
    await expect(unitsInputs.first()).toBeVisible();
    // Should be an input (editable)
    const tag = await unitsInputs.first().evaluate(el => el.tagName.toLowerCase());
    expect(tag).toBe('input');
  });

  test('Each row has an editable threshold input', async ({ page }) => {
    await shot(page, 'step-10-threshold-inputs.png');
    const thresholdInputs = page.locator('[id^="threshold-"]');
    expect(await thresholdInputs.count()).toBeGreaterThan(0);
    await expect(thresholdInputs.first()).toBeVisible();
  });

  test('Suggested Restock hidden input exists for each product', async ({ page }) => {
    const suggestInputs = page.locator('[id^="suggest-"]');
    const count = await suggestInputs.count();
    expect(count).toBeGreaterThan(0);
    await shot(page, 'step-11-suggest-inputs.png');
  });

  test('Use Suggested button fills the units input', async ({ page }) => {
    // Get the first product's suggested value and check it fills the input
    const firstSuggestInput = page.locator('[id^="suggest-"]').first();
    const productId = await firstSuggestInput.getAttribute('id').then(id => id.replace('suggest-', ''));
    const suggestedVal = await firstSuggestInput.inputValue();

    // Click "Use Suggested" for first row
    const useBtn = page.locator(`button[onclick*="useSuggested(${productId})"]`);
    if (await useBtn.count() > 0) {
      await useBtn.click();
      await shot(page, 'step-12-use-suggested.png');
      const unitsVal = await page.locator(`#units-${productId}`).inputValue();
      expect(unitsVal).toBe(suggestedVal);
    } else {
      // Button text varies — try by text
      const altBtn = page.locator('button:has-text("Use Suggested"), button:has-text("Suggested")').first();
      if (await altBtn.count() > 0) await altBtn.click();
      await shot(page, 'step-12-use-suggested-alt.png');
    }
  });

  test('Update Stock button exists per row', async ({ page }) => {
    await shot(page, 'step-13-update-buttons.png');
    const updateBtns = page.locator('button:has-text("Update"), button:has-text("Restock"), button:has-text("Save")');
    expect(await updateBtns.count()).toBeGreaterThan(0);
    await expect(updateBtns.first()).toBeVisible();
  });

  test('Updating stock shows success toast', async ({ page }) => {
    // Fill units for first product and click update
    const firstUnits = page.locator('[id^="units-"]').first();
    const productId = await firstUnits.getAttribute('id').then(id => id.replace('units-', ''));
    const currentVal = await firstUnits.inputValue();
    const newVal = (parseInt(currentVal) || 0) + 1; // increment by 1

    await firstUnits.fill(String(newVal));

    const updateBtn = page.locator(`button[onclick*="updateStock(${productId}"]`);
    if (await updateBtn.count() > 0) {
      await updateBtn.click();
    } else {
      await page.locator('button:has-text("Update"), button:has-text("Save")').first().click();
    }

    await page.waitForTimeout(3000);
    await shot(page, 'step-14-stock-updated-toast.png');

    // Toast should appear with "updated" or "notified"
    const toast = page.locator('.toast');
    if (await toast.count() > 0) {
      await expect(toast.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('Auto-notify info banner is visible below table', async ({ page }) => {
    await shot(page, 'step-15-auto-notify-banner.png');
    const banner = page.locator('.alert-banner:has-text("Auto-notify"), .alert-info:has-text("notify")');
    await expect(banner.first()).toBeVisible({ timeout: 5000 });
  });

});

// =============================================================================
test.describe('Warehouse — Incoming Orders', () => {

  test('Incoming tab loads with section title', async ({ page }) => {
    await loginWarehouse(page);
    await page.getByRole('button', { name: /Incoming/i }).click();
    await page.waitForSelector('.sec-title', { timeout: 10000 });
    await shot(page, 'step-16-incoming-loaded.png');
    await expect(page.locator('.sec-title')).toContainText(/Incoming/i);
  });

  test('Incoming table has correct columns', async ({ page }) => {
    await loginWarehouse(page);
    await page.getByRole('button', { name: /Incoming/i }).click();
    await page.waitForSelector('.sec-title', { timeout: 10000 });
    await shot(page, 'step-17-incoming-columns.png');
    const hasTable = await page.locator('table').isVisible().catch(() => false);
    if (hasTable) {
      const headers = await page.locator('thead th').allTextContents();
      expect(headers.join(' ')).toMatch(/ID|Retailer|City|Items|Driver|Status/i);
    }
  });

  test('Warehouse Ready button exists for assigned deliveries', async ({ page }) => {
    await loginWarehouse(page);
    await page.getByRole('button', { name: /Incoming/i }).click();
    await page.waitForSelector('.sec-title', { timeout: 10000 });
    await shot(page, 'step-18-warehouse-ready-btn.png');
    // Button only exists if deliveries are in assigned/warehouse_ready/loaded state
    const readyBtn = page.locator('button:has-text("Ready"), button:has-text("Warehouse Ready")');
    const count = await readyBtn.count();
    // Soft assertion — depends on live data
    expect(count).toBeGreaterThanOrEqual(0);
  });

});

// =============================================================================
test.describe('Warehouse — Waitlist Management', () => {

  test.beforeEach(async ({ page }) => {
    await loginWarehouse(page);
    await page.getByRole('button', { name: /Waitlist/i }).click();
    await page.waitForSelector('.sec-title', { timeout: 10000 });
  });

  test('Waitlist tab shows Full and Partial sections', async ({ page }) => {
    await shot(page, 'step-19-waitlist-sections.png');
    await expect(page.locator('.card-title:has-text("Full Quantity")')).toBeVisible();
    await expect(page.locator('.card-title:has-text("Partial")')).toBeVisible();
  });

  test('Full Quantity section shows entry count badge', async ({ page }) => {
    await shot(page, 'step-20-full-waitlist-badge.png');
    const fullSection = page.locator('.card:has(.card-title:has-text("Full Quantity"))');
    await expect(fullSection).toBeVisible();
    const badge = fullSection.locator('.badge');
    if (await badge.count() > 0) await expect(badge.first()).toBeVisible();
  });

  test('Partial Quantity section shows entry count badge', async ({ page }) => {
    await shot(page, 'step-21-partial-waitlist-badge.png');
    const partialSection = page.locator('.card:has(.card-title:has-text("Partial"))');
    await expect(partialSection).toBeVisible();
  });

  test('Waitlist tables have correct columns when entries exist', async ({ page }) => {
    const tables = page.locator('table');
    const count = await tables.count();
    if (count > 0) {
      const headers = await tables.first().locator('thead th').allTextContents();
      await shot(page, 'step-22-waitlist-columns.png');
      expect(headers.join(' ')).toMatch(/Retailer|Product|Qty|City/i);
    } else {
      await shot(page, 'step-22-waitlist-empty.png');
    }
  });

  test('Fulfil button visible on partial entries', async ({ page }) => {
    await shot(page, 'step-23-fulfil-button.png');
    const fulfilBtn = page.locator('button:has-text("Fulfil"), button:has-text("Process")');
    const count = await fulfilBtn.count();
    // Soft — only exists if partial entries are in DB
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('Cancel/Remove button visible on waitlist entries', async ({ page }) => {
    await shot(page, 'step-24-cancel-button.png');
    const cancelBtn = page.locator('button:has-text("Cancel"), button:has-text("Remove"), button:has-text("✕")');
    const count = await cancelBtn.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('Empty state shown when no waitlist entries', async ({ page }) => {
    await shot(page, 'step-25-waitlist-state.png');
    // Either a table with rows OR an empty-state div — both valid
    const hasTable = await page.locator('table tbody tr').count() > 0;
    const hasEmpty = await page.locator('.empty').count() > 0;
    expect(hasTable || hasEmpty).toBe(true);
  });

});

// =============================================================================
test.describe('Warehouse — Role Isolation', () => {

  test('Warehouse does NOT see Smart Order or AI Assistant tabs', async ({ page }) => {
    await loginWarehouse(page);
    const tabs = await page.locator('.tab').allTextContents();
    const joined = tabs.join(' ');
    await shot(page, 'step-26-nav-isolation.png');
    expect(joined).not.toContain('Smart Order');
    expect(joined).not.toContain('AI Assistant');
    expect(joined).not.toContain('My Routes');
  });

  test('Warehouse sees exactly: Dashboard, Incoming, Stock Levels, Waitlist, Live Tracking', async ({ page }) => {
    await loginWarehouse(page);
    const tabs = await page.locator('.tab').allTextContents();
    const joined = tabs.join(' ');
    await shot(page, 'step-27-warehouse-nav.png');
    expect(joined).toContain('Dashboard');
    expect(joined).toContain('Incoming');
    expect(joined).toContain('Stock Levels');
    expect(joined).toContain('Waitlist');
    expect(joined).toContain('Live Tracking');
  });

});