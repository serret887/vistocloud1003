// Step-by-step validation tests
import { test, expect } from '@playwright/test';
import { createApplication, fillClientInfo, fillAddress, navigateToStep, waitForAutoSave } from './helpers';

test.describe('Step Validation Tests', () => {
  test('Client Info step validation', async ({ page }) => {
    await createApplication(page);
    
    // Try to navigate without filling required fields
    await navigateToStep(page, 'employment');
    await page.waitForTimeout(1000);
    
    // Navigate back
    await navigateToStep(page, 'client information');
    await page.waitForTimeout(1000);
    
    // Should show validation errors
    const errors = page.locator('[role="alert"], .text-destructive');
    const errorCount = await errors.count();
    expect(errorCount).toBeGreaterThan(0);
    
    // Fill required fields
    await fillClientInfo(page, {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '5551234567',
      ssn: '123456789',
      dob: '1990-01-01',
      citizenship: 'us citizen',
      maritalStatus: 'single'
    });
    
    await fillAddress(page, {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      moveInDate: '2020-01-01'
    });
    
    await waitForAutoSave(page);
    
    // Navigate away and back
    await navigateToStep(page, 'employment');
    await page.waitForTimeout(1000);
    await navigateToStep(page, 'client information');
    await page.waitForTimeout(1000);
    
    // Errors should be cleared
    const newErrorCount = await errors.count();
    expect(newErrorCount).toBe(0);
  });

  test('Employment step validation', async ({ page }) => {
    await createApplication(page);
    
    // Fill client info first
    await fillClientInfo(page, {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '5551234567',
      ssn: '123456789',
      dob: '1990-01-01',
      citizenship: 'us citizen',
      maritalStatus: 'single'
    });
    
    await fillAddress(page, {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      moveInDate: '2020-01-01'
    });
    
    await navigateToStep(page, 'employment');
    await page.waitForTimeout(500);
    
    // Add employment but don't fill required fields
    await page.getByRole('button', { name: /add employer/i }).click();
    await page.waitForTimeout(500);
    
    // Navigate away
    await navigateToStep(page, 'income');
    await page.waitForTimeout(1000);
    
    // Navigate back
    await navigateToStep(page, 'employment');
    await page.waitForTimeout(1000);
    
    // Should show validation errors
    const errors = page.locator('[role="alert"], .text-destructive');
    const errorCount = await errors.count();
    expect(errorCount).toBeGreaterThan(0);
  });

  test('Assets step requires at least one asset', async ({ page }) => {
    await createApplication(page);
    
    // Fill minimal required data
    await fillClientInfo(page, {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '5551234567',
      ssn: '123456789',
      dob: '1990-01-01',
      citizenship: 'us citizen',
      maritalStatus: 'single'
    });
    
    await fillAddress(page, {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      moveInDate: '2020-01-01'
    });
    
    await navigateToStep(page, 'assets');
    await page.waitForTimeout(500);
    
    // Navigate away without adding asset
    await navigateToStep(page, 'real estate');
    await page.waitForTimeout(1000);
    
    // Navigate back
    await navigateToStep(page, 'assets');
    await page.waitForTimeout(1000);
    
    // Should show validation error
    const errors = page.locator('[role="alert"], .text-destructive');
    const errorCount = await errors.count();
    expect(errorCount).toBeGreaterThan(0);
  });

  test('Validation errors clear when fields are corrected', async ({ page }) => {
    await createApplication(page);
    
    // Fill invalid email
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByLabel(/email/i).blur();
    await page.waitForTimeout(500);
    
    // Check for error
    let emailInput = page.getByLabel(/email/i);
    let hasError = await emailInput.evaluate((el) => {
      return el.getAttribute('aria-invalid') === 'true' ||
             el.classList.contains('border-destructive');
    });
    
    // Fix email
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
});


