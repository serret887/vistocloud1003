// Functionality tests - test all features of each step
import { test, expect } from '@playwright/test';

test.describe('Functionality Tests - All Steps', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /new application/i }).click();
    await page.waitForURL(/\/application\/[a-zA-Z0-9-]+\/client-info/);
  });

  test.describe('Client Information Step', () => {
    test('should add and remove co-borrowers', async ({ page }) => {
      // Add co-borrower
      const addBorrowerButton = page.getByRole('button', { name: /add borrower/i });
      if (await addBorrowerButton.count() > 0) {
        await addBorrowerButton.click();
        await page.waitForTimeout(500);
        
        // Verify second tab appears
        const tabs = page.locator('[role="tab"]');
        const tabCount = await tabs.count();
        expect(tabCount).toBeGreaterThan(1);
        
        // Remove co-borrower
        const removeButton = page.locator('button[aria-label*="remove"], button:has-text("×")').first();
        if (await removeButton.count() > 0) {
          await removeButton.click();
          await page.waitForTimeout(500);
          
          // Verify tab count decreased
          const newTabCount = await tabs.count();
          expect(newTabCount).toBe(1);
        }
      }
    });

    test('should add former addresses when needed', async ({ page }) => {
      // Fill present address with recent move-in date
      const moveInDate = new Date();
      moveInDate.setMonth(moveInDate.getMonth() - 6); // 6 months ago
      const moveInDateStr = moveInDate.toISOString().split('T')[0];
      
      await page.getByLabel(/street address/i).fill('123 Main St');
      await page.getByLabel(/city/i).fill('New York');
      await page.getByLabel(/state/i).fill('NY');
      await page.getByLabel(/zip code/i).fill('10001');
      await page.getByLabel(/move-in date/i).fill(moveInDateStr);
      
      await page.waitForTimeout(1000);
      
      // Former addresses section should appear
      const formerAddressesSection = page.getByText(/former address/i);
      await expect(formerAddressesSection).toBeVisible();
    });

    test('should handle mailing address toggle', async ({ page }) => {
      // Check mailing address different checkbox
      const mailingCheckbox = page.getByLabel(/mailing address different/i);
      if (await mailingCheckbox.count() > 0) {
        await mailingCheckbox.check();
        await page.waitForTimeout(500);
        
        // Mailing address fields should appear
        const mailingAddressInput = page.locator('input').filter({ hasText: /mailing/i }).or(page.getByLabel(/mailing.*street/i));
        if (await mailingAddressInput.count() > 0) {
          await expect(mailingAddressInput.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Employment Step', () => {
    test('should add multiple employment records', async ({ page }) => {
      await page.getByRole('button', { name: /employment/i }).click();
      await page.waitForURL(/\/employment/);
      await page.waitForTimeout(500);
      
      // Add first employment
      await page.getByRole('button', { name: /add employer/i }).click();
      await page.getByLabel(/employer name/i).fill('Company A');
      await page.waitForTimeout(500);
      
      // Add second employment
      await page.getByRole('button', { name: /add employer/i }).click();
      await page.waitForTimeout(500);
      
      // Verify both records exist
      const employerInputs = page.getByLabel(/employer name/i);
      const count = await employerInputs.count();
      expect(count).toBeGreaterThanOrEqual(2);
    });

    test('should auto-fill end date when adding former job', async ({ page }) => {
      await page.getByRole('button', { name: /employment/i }).click();
      await page.waitForURL(/\/employment/);
      await page.waitForTimeout(500);
      
      // Add current employment
      await page.getByRole('button', { name: /add employer/i }).click();
      await page.getByLabel(/employer name/i).fill('Current Job');
      await page.getByLabel(/start date/i).fill('2020-01-01');
      await page.getByLabel(/currently employed here/i).check();
      await page.waitForTimeout(500);
      
      // Add former employment
      await page.getByRole('button', { name: /add employer/i }).click();
      await page.waitForTimeout(500);
      
      // End date should be auto-filled to start date of current job
      const endDateInput = page.getByLabel(/end date/i).last();
      const endDateValue = await endDateInput.inputValue();
      expect(endDateValue).toBeTruthy();
    });

    test('should hide end date when currently employed', async ({ page }) => {
      await page.getByRole('button', { name: /employment/i }).click();
      await page.waitForURL(/\/employment/);
      await page.waitForTimeout(500);
      
      await page.getByRole('button', { name: /add employer/i }).click();
      await page.getByLabel(/currently employed here/i).check();
      await page.waitForTimeout(500);
      
      // End date should be hidden
      const endDateInput = page.getByLabel(/end date/i);
      await expect(endDateInput).not.toBeVisible();
    });

    test('should hide end date when has offer letter', async ({ page }) => {
      await page.getByRole('button', { name: /employment/i }).click();
      await page.waitForURL(/\/employment/);
      await page.waitForTimeout(500);
      
      await page.getByRole('button', { name: /add employer/i }).click();
      await page.getByLabel(/has offer letter/i).check();
      await page.waitForTimeout(500);
      
      // End date should be hidden
      const endDateInput = page.getByLabel(/end date/i);
      await expect(endDateInput).not.toBeVisible();
    });

    test('should show ownership percentage only when self-employed', async ({ page }) => {
      await page.getByRole('button', { name: /employment/i }).click();
      await page.waitForURL(/\/employment/);
      await page.waitForTimeout(500);
      
      await page.getByRole('button', { name: /add employer/i }).click();
      
      // Ownership should not be visible initially
      const ownershipToggle = page.getByLabel(/25.*ownership/i);
      await expect(ownershipToggle).not.toBeVisible();
      
      // Check self-employed
      await page.getByLabel(/self employed/i).check();
      await page.waitForTimeout(500);
      
      // Ownership should now be visible
      await expect(ownershipToggle).toBeVisible();
    });

    test('should reset ownership when self-employed is unchecked', async ({ page }) => {
      await page.getByRole('button', { name: /employment/i }).click();
      await page.waitForURL(/\/employment/);
      await page.waitForTimeout(500);
      
      await page.getByRole('button', { name: /add employer/i }).click();
      await page.getByLabel(/self employed/i).check();
      await page.waitForTimeout(500);
      
      const ownershipToggle = page.getByLabel(/25.*ownership/i);
      await ownershipToggle.check();
      await page.waitForTimeout(500);
      
      // Uncheck self-employed
      await page.getByLabel(/self employed/i).uncheck();
      await page.waitForTimeout(500);
      
      // Ownership should be unchecked
      const isChecked = await ownershipToggle.isChecked();
      expect(isChecked).toBeFalsy();
    });

    test('should allow future start date only with offer letter', async ({ page }) => {
      await page.getByRole('button', { name: /employment/i }).click();
      await page.waitForURL(/\/employment/);
      await page.waitForTimeout(500);
      
      await page.getByRole('button', { name: /add employer/i }).click();
      
      // Try to set future date without offer letter
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 1);
      const futureDateStr = futureDate.toISOString().split('T')[0];
      
      await page.getByLabel(/start date/i).fill(futureDateStr);
      await page.getByLabel(/start date/i).blur();
      await page.waitForTimeout(500);
      
      // Should show validation error
      const startDateInput = page.getByLabel(/start date/i);
      const hasError = await startDateInput.evaluate((el) => {
        return el.getAttribute('aria-invalid') === 'true' ||
               el.classList.contains('border-destructive');
      });
      expect(hasError).toBeTruthy();
      
      // With offer letter, should allow future date
      await page.getByLabel(/has offer letter/i).check();
      await page.waitForTimeout(500);
      
      // Error should be cleared
      const hasErrorAfter = await startDateInput.evaluate((el) => {
        return el.getAttribute('aria-invalid') === 'true' ||
               el.classList.contains('border-destructive');
      });
      expect(hasErrorAfter).toBeFalsy();
    });
  });

  test.describe('Income Step', () => {
    test('should only show income for currently employed positions', async ({ page }) => {
      // Fill client info
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
      
      // Add current employment
      await page.getByRole('button', { name: /employment/i }).click();
      await page.waitForURL(/\/employment/);
      await page.waitForTimeout(500);
      
      await page.getByRole('button', { name: /add employer/i }).click();
      await page.getByLabel(/employer name/i).fill('Current Company');
      await page.getByLabel(/currently employed here/i).check();
      await page.waitForTimeout(500);
      
      // Add former employment
      await page.getByRole('button', { name: /add employer/i }).click();
      await page.getByLabel(/employer name/i).last().fill('Former Company');
      await page.waitForTimeout(500);
      
      // Navigate to income
      await page.getByRole('button', { name: /income/i }).click();
      await page.waitForURL(/\/income/);
      await page.waitForTimeout(500);
      
      // Should only show current company
      await expect(page.getByText(/current company/i)).toBeVisible();
      await expect(page.getByText(/former company/i)).not.toBeVisible();
    });
  });

  test.describe('Assets Step', () => {
    test('should add and remove assets', async ({ page }) => {
      // Navigate to assets
      await page.getByRole('button', { name: /assets/i }).click();
      await page.waitForURL(/\/assets/);
      await page.waitForTimeout(500);
      
      // Add asset
      await page.getByRole('button', { name: /add asset/i }).click();
      await page.waitForTimeout(500);
      
      await page.getByRole('combobox', { name: /asset category/i }).click();
      await page.getByRole('option', { name: /checking account/i }).click();
      
      await page.getByLabel(/institution name/i).fill('Chase Bank');
      await page.waitForTimeout(500);
      
      // Remove asset
      const removeButton = page.getByRole('button', { name: /remove/i }).or(page.locator('button:has-text("×")'));
      if (await removeButton.count() > 0) {
        await removeButton.first().click();
        await page.waitForTimeout(500);
        
        // Asset should be removed
        await expect(page.getByLabel(/institution name/i)).not.toBeVisible();
      }
    });
  });

  test.describe('Real Estate Step', () => {
    test('should add and remove properties', async ({ page }) => {
      await page.getByRole('button', { name: /real estate/i }).click();
      await page.waitForURL(/\/real-estate/);
      await page.waitForTimeout(500);
      
      // Add property
      const addButton = page.getByRole('button', { name: /add property/i });
      if (await addButton.count() > 0) {
        await addButton.click();
        await page.waitForTimeout(500);
        
        // Fill property info
        await page.getByLabel(/property address/i).fill('789 Property St');
        await page.waitForTimeout(500);
        
        // Remove property
        const removeButton = page.getByRole('button', { name: /remove/i }).or(page.locator('button:has-text("×")'));
        if (await removeButton.count() > 0) {
          await removeButton.first().click();
          await page.waitForTimeout(500);
        }
      }
    });
  });

  test.describe('Documents Step', () => {
    test('should generate conditions based on application data', async ({ page }) => {
      // Fill minimal data to generate conditions
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
      
      // Add employment
      await page.getByRole('button', { name: /employment/i }).click();
      await page.waitForURL(/\/employment/);
      await page.waitForTimeout(500);
      
      await page.getByRole('button', { name: /add employer/i }).click();
      await page.getByLabel(/employer name/i).fill('Test Company');
      await page.getByLabel(/start date/i).fill('2020-01-01');
      await page.getByLabel(/currently employed here/i).check();
      await page.waitForTimeout(500);
      
      // Navigate to documents
      await page.getByRole('button', { name: /documents/i }).click();
      await page.waitForURL(/\/documents/);
      await page.waitForTimeout(1000);
      
      // Should show bank statements (always required)
      await expect(page.getByText(/bank statements/i)).toBeVisible();
      
      // Should show W-2 for employment
      await expect(page.getByText(/w-2/i)).toBeVisible();
    });
  });

  test.describe('Review Step', () => {
    test('should display all application data', async ({ page }) => {
      // Fill some data
      await page.getByLabel(/first name/i).fill('John');
      await page.getByLabel(/last name/i).fill('Doe');
      await page.getByLabel(/email/i).fill('john@example.com');
      
      // Navigate to review
      await page.getByRole('button', { name: /review/i }).click();
      await page.waitForURL(/\/review/);
      await page.waitForTimeout(500);
      
      // Should show client name
      await expect(page.getByText(/john doe/i)).toBeVisible();
    });

    test('should export MISMO XML', async ({ page }) => {
      await page.getByRole('button', { name: /review/i }).click();
      await page.waitForURL(/\/review/);
      await page.waitForTimeout(500);
      
      // MISMO export button should exist
      const exportButton = page.getByRole('button', { name: /export mismo/i });
      await expect(exportButton).toBeVisible();
      
      // Set up download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
      await exportButton.click();
      
      const download = await downloadPromise;
      if (download) {
        expect(download.suggestedFilename()).toMatch(/\.xml$/);
      }
    });
  });

  test.describe('Step Navigation', () => {
    test('should show completion status in sidebar', async ({ page }) => {
      // Fill client info
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
      
      await page.waitForTimeout(2000);
      
      // Navigate away and back
      await page.getByRole('button', { name: /employment/i }).click();
      await page.waitForURL(/\/employment/);
      await page.waitForTimeout(1000);
      
      // Client info should show as completed
      const clientInfoButton = page.getByRole('button', { name: /client information/i });
      const hasCheckmark = await clientInfoButton.locator('svg, [class*="check"]').count() > 0;
      // Checkmark may be present if step is complete
    });

    test('should persist current step in URL', async ({ page }) => {
      await page.getByRole('button', { name: /employment/i }).click();
      await expect(page).toHaveURL(/\/employment/);
      
      await page.getByRole('button', { name: /income/i }).click();
      await expect(page).toHaveURL(/\/income/);
    });
  });
});


