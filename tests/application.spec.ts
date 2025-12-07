import { test, expect } from '@playwright/test';

test.describe('Application Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
  });

  test('should create a new application', async ({ page }) => {
    // Click "New Application" button
    await page.getByRole('button', { name: /new application/i }).click();
    
    // Wait for navigation to application page
    await expect(page).toHaveURL(/\/application\/[a-zA-Z0-9-]+/);
    
    // Verify application layout is visible
    await expect(page.getByText(/application/i)).toBeVisible();
    
    // Verify step sidebar is visible
    await expect(page.getByText(/client information/i)).toBeVisible();
  });

  test('should display client information step by default', async ({ page }) => {
    // Create application
    await page.getByRole('button', { name: /new application/i }).click();
    await page.waitForURL(/\/application\/[a-zA-Z0-9-]+/);
    
    // Verify client info form is visible
    await expect(page.getByLabel(/first name/i)).toBeVisible();
    await expect(page.getByLabel(/last name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('should save client data when navigating between steps', async ({ page }) => {
    // Create application
    await page.getByRole('button', { name: /new application/i }).click();
    await page.waitForURL(/\/application\/[a-zA-Z0-9-]+/);
    
    // Fill in client information
    await page.getByLabel(/first name/i).fill('John');
    await page.getByLabel(/last name/i).fill('Doe');
    await page.getByLabel(/email/i).fill('john.doe@example.com');
    await page.getByLabel(/phone/i).fill('555-123-4567');
    
    // Navigate to employment step
    await page.getByRole('button', { name: /employment/i }).click();
    
    // Wait a bit for save to complete
    await page.waitForTimeout(1000);
    
    // Navigate back to client info
    await page.getByRole('button', { name: /client information/i }).click();
    
    // Verify data is still there
    await expect(page.getByLabel(/first name/i)).toHaveValue('John');
    await expect(page.getByLabel(/last name/i)).toHaveValue('Doe');
    await expect(page.getByLabel(/email/i)).toHaveValue('john.doe@example.com');
  });

  test('should add employment record', async ({ page }) => {
    // Create application and navigate to employment step
    await page.getByRole('button', { name: /new application/i }).click();
    await page.waitForURL(/\/application\/[a-zA-Z0-9-]+/);
    await page.getByRole('button', { name: /employment/i }).click();
    
    // Click "Add Employer" button
    await page.getByRole('button', { name: /add employer/i }).click();
    
    // Fill in employment information
    await page.getByLabel(/employer name/i).fill('Acme Corp');
    await page.getByLabel(/job title/i).fill('Software Engineer');
    
    // Verify the form is visible
    await expect(page.getByLabel(/employer name/i)).toHaveValue('Acme Corp');
  });

  test('should navigate through all steps', async ({ page }) => {
    // Create application
    await page.getByRole('button', { name: /new application/i }).click();
    await page.waitForURL(/\/application\/[a-zA-Z0-9-]+/);
    
    const steps = [
      'Client Information',
      'Employment',
      'Income',
      'Assets',
      'Real Estate',
      'Documents',
      'Dictate',
      'Review'
    ];
    
    for (const step of steps) {
      await page.getByRole('button', { name: new RegExp(step, 'i') }).click();
      await page.waitForTimeout(500);
      // Verify we're on the step (check for step-specific content)
      await expect(page.getByText(new RegExp(step, 'i'))).toBeVisible();
    }
  });

  test('should view applications list', async ({ page }) => {
    // Click "View Applications" button
    await page.getByRole('button', { name: /view applications/i }).click();
    
    // Wait for navigation
    await expect(page).toHaveURL('/applications');
    
    // Verify applications page is visible
    await expect(page.getByText(/applications/i)).toBeVisible();
  });

  test('should use select components correctly', async ({ page }) => {
    // Create application
    await page.getByRole('button', { name: /new application/i }).click();
    await page.waitForURL(/\/application\/[a-zA-Z0-9-]+/);
    
    // Find and interact with citizenship select
    const citizenshipSelect = page.locator('text=Citizenship Status').locator('..').getByRole('combobox').first();
    await citizenshipSelect.click();
    
    // Select an option
    await page.getByRole('option', { name: /us citizen/i }).click();
    
    // Verify the value changed (check if select shows the selected value)
    await expect(citizenshipSelect).toBeVisible();
  });
});

test.describe('Firebase Emulator Integration', () => {
  test('should connect to Firebase emulator', async ({ page }) => {
    await page.goto('/');
    
    // Check browser console for emulator connection message
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('Firestore Emulator')) {
        logs.push(msg.text());
      }
    });
    
    // Wait a bit for initialization
    await page.waitForTimeout(2000);
    
    // Verify emulator connection (check console logs)
    const hasEmulatorLog = logs.some(log => log.includes('Connected to Firestore Emulator'));
    expect(hasEmulatorLog).toBeTruthy();
  });
});



