// ai-assistant.test.js — AI chat for retailer
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const baseURL = 'https://nestle-dms-frontend.vercel.app/';
const shot = async (page, name) => { fs.mkdirSync('screenshots/ai-assistant', { recursive: true }); await page.screenshot({ path: `screenshots/ai-assistant/${name}`, fullPage: true }); };

test.describe('AI Assistant — Retailer', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
    await page.getByRole('button', { name: /Cargills Manager/i }).click();
    await expect(page.locator('.tout')).toBeVisible({ timeout: 20000 });
    await page.getByRole('button', { name: /AI Assistant/i }).click();
    await expect(page.locator('#ai-input')).toBeVisible({ timeout: 10000 });
  });

  test('AI chat window loads with welcome message', async ({ page }) => {
    await shot(page, 'step-01-ai-loaded.png');
    await expect(page.locator('#ai-chat-messages')).toBeVisible();
    // Welcome message bubble should exist
    const bubbles = page.locator('.ai-bubble-ai');
    await expect(bubbles.first()).toBeVisible();
  });

  test('Quick-suggestion chips are visible', async ({ page }) => {
    await expect(page.locator('#ai-suggestions')).toBeVisible();
    await shot(page, 'step-02-suggestion-chips.png');
    const chips = page.locator('.ai-chip');
    expect(await chips.count()).toBeGreaterThanOrEqual(3);
  });

  test('Sending a message shows user bubble and AI reply', async ({ page }) => {
    await page.fill('#ai-input', 'What are my recent orders?');
    await shot(page, 'step-03-message-typed.png');
    await page.getByRole('button', { name: /send|➤|→/i }).click();

    // User bubble appears immediately
    await expect(page.locator('.ai-bubble-usr').first()).toBeVisible({ timeout: 5000 });
    await shot(page, 'step-04-user-bubble.png');

    // AI typing indicator then reply
    await page.waitForSelector('#ai-typing', { state: 'attached', timeout: 5000 }).catch(() => {});
    await page.waitForSelector('#ai-typing', { state: 'detached', timeout: 30000 }).catch(() => {});
    await shot(page, 'step-05-ai-reply.png');

    const aiBubbles = page.locator('.ai-bubble-ai');
    expect(await aiBubbles.count()).toBeGreaterThanOrEqual(2); // welcome + reply
  });

  test('Clicking suggestion chip sends a message', async ({ page }) => {
    await page.locator('.ai-chip').first().click();
    await page.waitForSelector('.ai-bubble-usr', { timeout: 5000 });
    await shot(page, 'step-06-chip-clicked.png');
    await expect(page.locator('.ai-bubble-usr').first()).toBeVisible();
  });

});