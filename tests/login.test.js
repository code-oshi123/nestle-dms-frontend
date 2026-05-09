// login.test.js — Nestlé Smart DMS
// URL: https://nestle-dms-frontend.vercel.app/
// Uses quick-access buttons to log in (no manual email/password typing)

const { test, expect } = require('@playwright/test');
const fs = require('fs');

const baseURL = 'https://nestle-dms-frontend.vercel.app/';

// ── screenshot helper ─────────────────────────────────────────────────────────
async function shot(page, name) {
  fs.mkdirSync('screenshots/login', { recursive: true });
  await page.screenshot({ path: `screenshots/login/${name}`, fullPage: true });
}

// ── logout helper ─────────────────────────────────────────────────────────────
async function logout(page) {
  await page.locator('.tout').click();
  await expect(page.locator('#login')).toBeVisible({ timeout: 8000 });
}

// =============================================================================
test.describe('Login — quick access buttons', () => {

  test('Retailer (Cargills Manager) can log in and out', async ({ page }) => {
    await page.goto(baseURL);
    await page.getByRole('button', { name: /Cargills Manager/i }).click();
    await expect(page.locator('.tout')).toBeVisible({ timeout: 15000 });
    await shot(page, 'step-01-retailer-logged-in.png');
    expect((await page.locator('#trole').textContent()).toLowerCase()).toContain('retailer');
    await logout(page);
    await shot(page, 'step-02-retailer-logged-out.png');
  });

  test('Order Team (Nuwan Dissanayake) can log in and out', async ({ page }) => {
    await page.goto(baseURL);
    await page.getByRole('button', { name: /Nuwan Dissanayake/i }).click();
    await expect(page.locator('.tout')).toBeVisible({ timeout: 15000 });
    await shot(page, 'step-03-orderteam-logged-in.png');
    expect((await page.locator('#trole').textContent()).toLowerCase()).toContain('order');
    await logout(page);
    await shot(page, 'step-04-orderteam-logged-out.png');
  });

  test('Warehouse (Kasun Bandara) can log in and out', async ({ page }) => {
    await page.goto(baseURL);
    await page.getByRole('button', { name: /Kasun Bandara/i }).click();
    await expect(page.locator('.tout')).toBeVisible({ timeout: 15000 });
    await shot(page, 'step-05-warehouse-logged-in.png');
    expect((await page.locator('#trole').textContent()).toLowerCase()).toContain('warehouse');
    await logout(page);
    await shot(page, 'step-06-warehouse-logged-out.png');
  });

  test('Distributor (Kumara Silva) can log in and out', async ({ page }) => {
    await page.goto(baseURL);
    await page.getByRole('button', { name: /Kumara Silva/i }).click();
    await expect(page.locator('.tout')).toBeVisible({ timeout: 15000 });
    await shot(page, 'step-07-distributor-logged-in.png');
    expect((await page.locator('#trole').textContent()).toLowerCase()).toContain('distributor');
    await logout(page);
    await shot(page, 'step-08-distributor-logged-out.png');
  });

});

// =============================================================================
test.describe('Login — failure cases', () => {

  test('Wrong password shows error, app stays hidden', async ({ page }) => {
    await page.goto(baseURL);
    await page.fill('#lemail', 'admin@nestle.lk');
    await page.fill('#lpass', 'wrongpassword');
    await page.click('#lbtn');
    await page.waitForFunction(() => !document.getElementById('lbtn').disabled, { timeout: 15000 });
    await shot(page, 'step-09-wrong-password-error.png');
    await expect(page.locator('#lerr')).toBeVisible();
    await expect(page.locator('#app')).toBeHidden();
  });

  test('Empty form shows validation error instantly', async ({ page }) => {
    await page.goto(baseURL);
    await page.click('#lbtn');
    await shot(page, 'step-10-empty-form-error.png');
    await expect(page.locator('#lerr')).toBeVisible();
    await expect(page.locator('#app')).toBeHidden();
  });

});