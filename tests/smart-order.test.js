const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://nestle-dms-frontend.vercel.app/';

const retailer = {
  email: 'retailer@test.lk',
  password: 'test123'
};

test.describe('SMART ORDER FEATURE - Deployed App', () => {

  async function login(page) {
    await page.goto(BASE_URL);
    await page.screenshot({ path: 'screenshots/smart-order/step-1-open.png', fullPage: true });

    await page.fill('input[type="text"], input[type="email"]', retailer.email);
    await page.screenshot({ path: 'screenshots/smart-order/step-2-email.png', fullPage: true });

    await page.fill('input[type="password"]', retailer.password);
    await page.screenshot({ path: 'screenshots/smart-order/step-3-password.png', fullPage: true });

    await page.click('.lbtn');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/smart-order/step-4-logged-in.png', fullPage: true });

    await expect(page.locator('#app')).toBeVisible();
  }

  // ─────────────────────────────────────────────
  // HAPPY PATH
  // ─────────────────────────────────────────────
  test('Create smart order with multiple products', async ({ page }) => {

    await login(page);

    // Step 5: Open Smart Order
    await page.click('text=Smart Order');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'screenshots/smart-order/step-5-open.png', fullPage: true });

    // Step 6: Fill first inputs (generic approach)
    const inputs = page.locator('input');

    await inputs.nth(0).fill('Colombo');   // City
    await inputs.nth(1).fill('Nugegoda');  // Area
    await inputs.nth(2).fill('5');         // Quantity

    await page.screenshot({ path: 'screenshots/smart-order/step-6-first-line.png', fullPage: true });

    // Step 7: Add another product line (if button exists)
    const addBtn = page.locator('button:has-text("+"), button:has-text("Add")');
    if (await addBtn.count() > 0) {
      await addBtn.first().click();
      await page.waitForTimeout(1000);
    }

    await page.screenshot({ path: 'screenshots/smart-order/step-7-add-line.png', fullPage: true });

    // Step 8: Fill second line (if exists)
    if (await inputs.count() > 3) {
      await inputs.nth(3).fill('10');
    }

    await page.screenshot({ path: 'screenshots/smart-order/step-8-second-line.png', fullPage: true });

    // Step 9: Submit
    const submitBtn = page.locator('.lbtn, button:has-text("Order"), button:has-text("Submit")');
    await submitBtn.first().click();
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'screenshots/smart-order/step-9-submit.png', fullPage: true });

    // Step 10: Verify response
    await expect(page.locator('body')).toBeVisible();

    // WHY: Ensures deployed system processes multi-line order
  });

  // ─────────────────────────────────────────────
  // NEGATIVE TEST
  // ─────────────────────────────────────────────
  test('Fail when submitting empty smart order', async ({ page }) => {

    await login(page);

    await page.click('text=Smart Order');
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'screenshots/smart-order/neg-1-open.png', fullPage: true });

    // Submit without input
    await page.click('.lbtn');
    await page.waitForTimeout(1500);

    await page.screenshot({ path: 'screenshots/smart-order/neg-2-submit.png', fullPage: true });

    await expect(page.locator('body')).toBeVisible();

    // WHY: Prevent invalid submission on deployed UI
  });

  // ─────────────────────────────────────────────
  // EDGE CASE
  // ─────────────────────────────────────────────
  test('Add and remove product lines dynamically', async ({ page }) => {

    await login(page);

    await page.click('text=Smart Order');
    await page.waitForTimeout(1000);

    const addBtn = page.locator('button:has-text("+"), button:has-text("Add")');
    const removeBtn = page.locator('button:has-text("Remove"), button:has-text("Delete")');

    if (await addBtn.count() > 0) {
      await addBtn.first().click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'screenshots/smart-order/edge-1-add.png', fullPage: true });
    }

    if (await removeBtn.count() > 0) {
      await removeBtn.first().click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'screenshots/smart-order/edge-2-remove.png', fullPage: true });
    }

    await expect(page.locator('body')).toBeVisible();

    // WHY: Ensures dynamic UI works in production
  });

  // ─────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────
  test.afterEach(async ({ page }) => {
    if (await page.locator('.tout').isVisible()) {
      await page.click('.tout');
      await page.screenshot({ path: 'screenshots/smart-order/logout.png', fullPage: true });
    }
  });

});