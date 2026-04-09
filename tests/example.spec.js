// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://nestle-dms-frontend.vercel.app';

/**
 * ------------------------------------------------------------------
 * Test Suite: Authentication & Login
 * Description: Validates the login functionality of the Nestlé Smart DMS.
 * Covers positive paths, negative paths, boundary/edge cases, and 
 * verifies the correct application states. Suitable for QA Automation.
 * ------------------------------------------------------------------
 */
test.describe('Nestlé Smart DMS - Login Functionality', () => {

  test.beforeEach(async ({ page }) => {
    // Arrange: Navigate to the application's login endpoint before every test
    await page.goto(`${BASE_URL}/login`);
  });

  test('Positive Test: Successful login with valid credentials', async ({ page }) => {
    // Step 1: Capture the initial state of the login screen
    await page.screenshot({ path: 'screenshots/login-page-load.png' });

    // Step 2: Locate the input fields
    const emailInput = page.locator('#lemail');
    const passwordInput = page.locator('#lpass');
    
    // Step 3: Enter valid registered credentials (Using Order Team Demo Profile)
    await emailInput.fill('order@nestle.lk');
    await passwordInput.fill('order123');

    // Step 4: Capture form state before submission
    await page.screenshot({ path: 'screenshots/before-valid-login-submit.png', fullPage: true });

    // Step 5: Locate and click the "Sign In" button
    const signInButton = page.locator('#lbtn');
    await signInButton.click();

    // Step 6: Assert successful authentication by checking for the main app dashboard
    const appContainer = page.locator('#app');
    await expect(appContainer).toBeVisible({ timeout: 10000 });
    
    // Step 7: Verify specific user profile information was loaded correctly
    const userName = page.locator('#tname');
    await expect(userName).toContainText('Nuwan Dissanayake');

    // Step 8: Capture the dashboard as evidence of successful login
    await page.screenshot({ path: 'screenshots/after-valid-login-dashboard.png', fullPage: true });
  });

  test('Negative Test: Unsuccessful login with invalid credentials', async ({ page }) => {
    // Step 1: Enter an unregistered email and an incorrect password
    await page.locator('#lemail').fill('wronguser@invalid.com');
    await page.locator('#lpass').fill('wrongpass123!');

    // Step 2: Capture evidence of the bad data entry
    await page.screenshot({ path: 'screenshots/before-invalid-login.png' });

    // Step 3: Attempt to submit the form
    await page.locator('#lbtn').click();

    // Step 4: Validate that an appropriate error banner is presented to the user
    const errorMessage = page.locator('#lerr');
    
    // Assert strictly on visibility and text content
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText('Incorrect email or password.');

    // Step 5: Ensure the dashboard is NOT displayed
    await expect(page.locator('#app')).toBeHidden();

    // Step 6: Capture evidence of handled error state
    await page.screenshot({ path: 'screenshots/after-invalid-login-error.png' });
  });

  test('Edge Case: Submitting empty form fields triggers client-side validation', async ({ page }) => {
    // Step 1: Explicitly clear the fields to trigger boundary errors
    await page.locator('#lemail').fill('');
    await page.locator('#lpass').fill('');

    // Step 2: Attempt to sign in without providing necessary arguments
    await page.locator('#lbtn').click();

    // Step 3: Validate client-side validation catches the blank submit
    const errorMessage = page.locator('#lerr');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText('Enter email and password.');

    // Step 4: Capture evidence of validation intervention
    await page.screenshot({ path: 'screenshots/empty-fields-validation.png' });
  });
  
  test('Feature Verification: Quick demo login handles automated auth correctly', async ({ page }) => {
    // Step 1: Identify Quick Access Demo Accounts
    // Selecting the first demo option: "Cargills Manager" (Retailer Profile)
    const retailerDemoButton = page.locator('.qbtn').nth(0);
    
    // Step 2: Capture state prior to click
    await page.screenshot({ path: 'screenshots/before-quick-login.png' });
    
    // Step 3: Execute the quick login pathway
    await retailerDemoButton.click();
    
    // Step 4: Verify seamless redirection to dashboard
    const appContainer = page.locator('#app');
    await expect(appContainer).toBeVisible({ timeout: 10000 });
    
    // Step 5: Verify the correct Role label is assigned
    const roleText = page.locator('#trole');
    await expect(roleText).toContainText('Retailer');

    // Step 6: Capture successful bypass/delegated login
    await page.screenshot({ path: 'screenshots/after-quick-login-retailer.png' });
  });

});