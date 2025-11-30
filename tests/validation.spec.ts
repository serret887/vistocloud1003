// Validation tests - ensure all validation rules work correctly
import { test, expect } from '@playwright/test';

test.describe('Validation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /new application/i }).click();
    await page.waitForURL(/\/application\/[a-zA-Z0-9-]+\/client-info/);
  });

  test('should validate required fields in Client Info step', async ({ page }) => {
    // Try to navigate away without filling required fields
    await page.getByRole('button', { name: /employment/i }).click();
    await page.waitForURL(/\/employment/);
    await page.waitForTimeout(1000);
    
    // Navigate back
    await page.getByRole('button', { name: /client information/i }).click();
    await page.waitForURL(/\/client-info/);
    await page.waitForTimeout(1000);
    
    // Check for validation errors
    const errorMessages = page.locator('.text-destructive, [role="alert"]');
    const errorCount = await errorMessages.count();
    expect(errorCount).toBeGreaterThan(0);
    
    // Verify required fields show errors
    const firstNameInput = page.getByLabel(/first name/i);
    const hasError = await firstNameInput.evaluate((el) => {
      return el.classList.contains('border-destructive') || 
             el.getAttribute('aria-invalid') === 'true';
    });
    expect(hasError).toBeTruthy();
  });

  test('should validate email format', async ({ page }) => {
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByLabel(/email/i).blur();
    await page.waitForTimeout(500);
    
    // Check for email validation error
    const emailInput = page.getByLabel(/email/i);
    const isInvalid = await emailInput.evaluate((el) => {
      return el.getAttribute('aria-invalid') === 'true' ||
             el.classList.contains('border-destructive');
    });
    expect(isInvalid).toBeTruthy();
  });

  test('should validate phone number format', async ({ page }) => {
    await page.getByLabel(/phone/i).fill('123');
    await page.getByLabel(/phone/i).blur();
    await page.waitForTimeout(500);
    
    // Phone should auto-format or show error
    const phoneInput = page.getByLabel(/phone/i);
    const value = await phoneInput.inputValue();
    
    // Either should be formatted or show error
    const hasError = await phoneInput.evaluate((el) => {
      return el.getAttribute('aria-invalid') === 'true' ||
             el.classList.contains('border-destructive');
    });
    
    // If not formatted correctly, should have error
    if (!/\(\d{3}\)/.test(value)) {
      expect(hasError).toBeTruthy();
    }
  });

  test('should validate SSN format', async ({ page }) => {
    await page.getByLabel(/ssn/i).fill('123456');
    await page.getByLabel(/ssn/i).blur();
    await page.waitForTimeout(500);
    
    // SSN should be formatted or show error
    const ssnInput = page.getByLabel(/ssn/i);
    const value = await ssnInput.inputValue();
    
    // Should be formatted as XXX-XX-XXXX
    const isValidFormat = /^\d{3}-\d{2}-\d{4}$/.test(value);
    expect(isValidFormat).toBeTruthy();
  });

  test('should validate date of birth (18+ years)', async ({ page }) => {
    const today = new Date();
    const recentDate = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());
    const recentDateStr = recentDate.toISOString().split('T')[0];
    
    await page.getByLabel(/date of birth/i).fill(recentDateStr);
    await page.getByLabel(/date of birth/i).blur();
    await page.waitForTimeout(500);
    
    // Should show error for under 18
    const dobInput = page.getByLabel(/date of birth/i);
    const hasError = await dobInput.evaluate((el) => {
      return el.getAttribute('aria-invalid') === 'true' ||
             el.classList.contains('border-destructive');
    });
    expect(hasError).toBeTruthy();
  });

  test('should validate employment required fields', async ({ page }) => {
    // Fill client info minimally
    await page.getByLabel(/first name/i).fill('John');
    await page.getByLabel(/last name/i).fill('Doe');
    await page.getByLabel(/email/i).fill('john@example.com');
    await page.getByLabel(/phone/i).fill('5551234567');
    await page.getByLabel(/ssn/i).fill('123456789');
    await page.getByLabel(/date of birth/i).fill('1990-01-01');
    
    await page.getByRole('combobox', { name: /citizenship status/i }).click();
    await page.getByRole('option', { name: /us citizen/i }).click();
    
    await page.getByRole('combobox', { name: /marital status/i }).click();
    await page.getByRole('option', { name: /single/i }).click();
    
    // Navigate to employment
    await page.getByRole('button', { name: /employment/i }).click();
    await page.waitForURL(/\/employment/);
    await page.waitForTimeout(500);
    
    // Add employment but don't fill required fields
    await page.getByRole('button', { name: /add employer/i }).click();
    await page.waitForTimeout(500);
    
    // Navigate away
    await page.getByRole('button', { name: /income/i }).click();
    await page.waitForURL(/\/income/);
    await page.waitForTimeout(1000);
    
    // Navigate back
    await page.getByRole('button', { name: /employment/i }).click();
    await page.waitForURL(/\/employment/);
    await page.waitForTimeout(1000);
    
    // Check for validation errors
    const errorMessages = page.locator('.text-destructive, [role="alert"]');
    const errorCount = await errorMessages.count();
    expect(errorCount).toBeGreaterThan(0);
  });

  test('should clear validation errors when field is corrected', async ({ page }) => {
    // Fill invalid email
    await page.getByLabel(/email/i).fill('invalid');
    await page.getByLabel(/email/i).blur();
    await page.waitForTimeout(500);
    
    // Check for error
    let emailInput = page.getByLabel(/email/i);
    let hasError = await emailInput.evaluate((el) => {
      return el.getAttribute('aria-invalid') === 'true' ||
             el.classList.contains('border-destructive');
    });
    expect(hasError).toBeTruthy();
    
    // Fix the email
    await emailInput.fill('valid@example.com');
    await emailInput.blur();
    await page.waitForTimeout(500);
    
    // Error should be cleared
    emailInput = page.getByLabel(/email/i);
    hasError = await emailInput.evaluate((el) => {
      return el.getAttribute('aria-invalid') === 'true' ||
             el.classList.contains('border-destructive');
    });
    expect(hasError).toBeFalsy();
  });

  test('should validate money input fields', async ({ page }) => {
    // Navigate to employment
    await page.getByRole('button', { name: /employment/i }).click();
    await page.waitForURL(/\/employment/);
    await page.waitForTimeout(500);
    
    await page.getByRole('button', { name: /add employer/i }).click();
    await page.waitForTimeout(500);
    
    // Try invalid money input
    const incomeInput = page.getByLabel(/gross monthly income/i);
    if (await incomeInput.count() > 0) {
      await incomeInput.fill('abc');
      await incomeInput.blur();
      await page.waitForTimeout(500);
      
      // Should only accept numbers
      const value = await incomeInput.inputValue();
      expect(value).not.toContain('abc');
    }
  });

  test('should validate address fields', async ({ page }) => {
    // Try to navigate away without address
    await page.getByRole('button', { name: /employment/i }).click();
    await page.waitForURL(/\/employment/);
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: /client information/i }).click();
    await page.waitForURL(/\/client-info/);
    await page.waitForTimeout(1000);
    
    // Address should be required
    const addressInput = page.getByLabel(/street address/i);
    const hasError = await addressInput.evaluate((el) => {
      return el.getAttribute('aria-invalid') === 'true' ||
             el.classList.contains('border-destructive');
    });
    expect(hasError).toBeTruthy();
  });

  test('should validate assets step requires at least one asset', async ({ page }) => {
    // Fill minimal required data
    await page.getByLabel(/first name/i).fill('John');
    await page.getByLabel(/last name/i).fill('Doe');
    await page.getByLabel(/email/i).fill('john@example.com');
    await page.getByLabel(/phone/i).fill('5551234567');
    await page.getByLabel(/ssn/i).fill('123456789');
    await page.getByLabel(/date of birth/i).fill('1990-01-01');
    
    await page.getByRole('combobox', { name: /citizenship status/i }).click();
    await page.getByRole('option', { name: /us citizen/i }).click();
    
    await page.getByLabel(/street address/i).fill('123 Main St');
    await page.getByLabel(/city/i).fill('New York');
    await page.getByLabel(/state/i).fill('NY');
    await page.getByLabel(/zip code/i).fill('10001');
    await page.getByLabel(/move-in date/i).fill('2020-01-01');
    
    // Navigate to assets
    await page.getByRole('button', { name: /assets/i }).click();
    await page.waitForURL(/\/assets/);
    await page.waitForTimeout(500);
    
    // Navigate away without adding asset
    await page.getByRole('button', { name: /real estate/i }).click();
    await page.waitForURL(/\/real-estate/);
    await page.waitForTimeout(1000);
    
    // Navigate back
    await page.getByRole('button', { name: /assets/i }).click();
    await page.waitForURL(/\/assets/);
    await page.waitForTimeout(1000);
    
    // Should show validation error
    const errorMessages = page.locator('.text-destructive, [role="alert"]');
    const errorCount = await errorMessages.count();
    expect(errorCount).toBeGreaterThan(0);
  });
});

