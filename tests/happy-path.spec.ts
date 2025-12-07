// Happy path e2e test - complete application flow without voice dictation
import { test, expect } from '@playwright/test';

test.describe('Happy Path - Complete Application Flow', () => {
  let appId: string;

  test('should complete full application flow', async ({ page }) => {
    // Step 1: Create new application
    await page.goto('/');
    await expect(page.getByRole('button', { name: /new application/i })).toBeVisible();
    await page.getByRole('button', { name: /new application/i }).click();
    
    // Wait for navigation and capture appId
    await page.waitForURL(/\/application\/[a-zA-Z0-9-]+\/client-info/);
    const url = page.url();
    appId = url.match(/\/application\/([a-zA-Z0-9-]+)/)?.[1] || '';
    expect(appId).toBeTruthy();

    // Step 2: Fill Client Information
    await expect(page.getByLabel(/first name/i)).toBeVisible();
    await page.getByLabel(/first name/i).fill('John');
    await page.getByLabel(/last name/i).fill('Doe');
    await page.getByLabel(/email/i).fill('john.doe@example.com');
    await page.getByLabel(/phone/i).fill('5551234567');
    await page.getByLabel(/ssn/i).fill('123456789');
    await page.getByLabel(/date of birth/i).fill('1990-01-15');
    
    // Select citizenship status
    await page.getByRole('combobox', { name: /citizenship status/i }).click();
    await page.getByRole('option', { name: /us citizen/i }).click();
    
    // Select marital status
    await page.getByRole('combobox', { name: /marital status/i }).click();
    await page.getByRole('option', { name: /married/i }).click();
    
    // Fill present address
    await page.getByLabel(/street address/i).fill('123 Main St');
    await page.getByLabel(/city/i).fill('New York');
    await page.getByLabel(/state/i).fill('NY');
    await page.getByLabel(/zip code/i).fill('10001');
    await page.getByLabel(/move-in date/i).fill('2020-01-01');
    
    // Navigate to Employment step
    await page.getByRole('button', { name: /employment/i }).click();
    await page.waitForURL(/\/employment/);
    await page.waitForTimeout(500); // Wait for step to load

    // Step 3: Add Employment Record
    await expect(page.getByRole('button', { name: /add employer/i })).toBeVisible();
    await page.getByRole('button', { name: /add employer/i }).click();
    
    await page.getByLabel(/employer name/i).fill('Acme Corporation');
    await page.getByLabel(/job title/i).fill('Software Engineer');
    await page.getByLabel(/start date/i).fill('2020-01-01');
    await page.getByLabel(/phone/i).fill('5559876543');
    
    // Fill employer address
    await page.getByLabel(/street address/i).first().fill('456 Business Ave');
    await page.getByLabel(/city/i).first().fill('New York');
    await page.getByLabel(/state/i).first().fill('NY');
    await page.getByLabel(/zip code/i).first().fill('10002');
    
    // Mark as currently employed
    await page.getByLabel(/currently employed here/i).check();
    
    // Fill monthly income
    await page.getByLabel(/gross monthly income/i).fill('8000');
    
    await page.waitForTimeout(500); // Wait for auto-save

    // Navigate to Income step
    await page.getByRole('button', { name: /income/i }).click();
    await page.waitForURL(/\/income/);
    await page.waitForTimeout(500);

    // Step 4: Fill Income (should auto-populate from employment)
    // Verify income is shown from current employment
    await expect(page.getByText(/acme corporation/i)).toBeVisible();
    
    // Navigate to Assets step
    await page.getByRole('button', { name: /assets/i }).click();
    await page.waitForURL(/\/assets/);
    await page.waitForTimeout(500);

    // Step 5: Add Asset
    await page.getByRole('button', { name: /add asset/i }).click();
    
    await page.getByRole('combobox', { name: /asset category/i }).click();
    await page.getByRole('option', { name: /checking account/i }).click();
    
    await page.getByLabel(/institution name/i).fill('Chase Bank');
    await page.getByLabel(/account number/i).fill('1234567890');
    await page.getByLabel(/account balance/i).fill('50000');
    
    await page.waitForTimeout(500);

    // Navigate to Real Estate step
    await page.getByRole('button', { name: /real estate/i }).click();
    await page.waitForURL(/\/real-estate/);
    await page.waitForTimeout(500);

    // Step 6: Real Estate (can be empty for happy path)
    // Just verify the step loads
    await expect(page.getByText(/real estate owned/i)).toBeVisible();

    // Navigate to Documents step
    await page.getByRole('button', { name: /documents/i }).click();
    await page.waitForURL(/\/documents/);
    await page.waitForTimeout(500);

    // Step 7: Documents (verify conditions are generated)
    await expect(page.getByText(/bank statements/i)).toBeVisible();
    await expect(page.getByText(/w-2/i)).toBeVisible();

    // Navigate to Review step (skip Dictate)
    await page.getByRole('button', { name: /review/i }).click();
    await page.waitForURL(/\/review/);
    await page.waitForTimeout(500);

    // Step 8: Review & Submit
    await expect(page.getByText(/review/i)).toBeVisible();
    await expect(page.getByText(/john doe/i)).toBeVisible();
    await expect(page.getByText(/acme corporation/i)).toBeVisible();
    
    // Verify MISMO export button exists
    await expect(page.getByRole('button', { name: /export mismo/i })).toBeVisible();
  });

  test('should persist data across page reloads', async ({ page }) => {
    // Create and fill application
    await page.goto('/');
    await page.getByRole('button', { name: /new application/i }).click();
    await page.waitForURL(/\/application\/[a-zA-Z0-9-]+\/client-info/);
    
    const url = page.url();
    appId = url.match(/\/application\/([a-zA-Z0-9-]+)/)?.[1] || '';
    
    // Fill client info
    await page.getByLabel(/first name/i).fill('Jane');
    await page.getByLabel(/last name/i).fill('Smith');
    await page.getByLabel(/email/i).fill('jane.smith@example.com');
    
    await page.waitForTimeout(2000); // Wait for auto-save
    
    // Reload page
    await page.reload();
    await page.waitForURL(/\/application\/[a-zA-Z0-9-]+\/client-info/);
    
    // Verify data persisted
    await expect(page.getByLabel(/first name/i)).toHaveValue('Jane');
    await expect(page.getByLabel(/last name/i)).toHaveValue('Smith');
    await expect(page.getByLabel(/email/i)).toHaveValue('jane.smith@example.com');
  });
});


