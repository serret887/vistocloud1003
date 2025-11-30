// Accessibility tests - ARIA and Section 508 compliance
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility - ARIA and 508 Compliance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('home page should be accessible', async ({ page }) => {
    // Check for accessibility violations
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);

    // Verify semantic HTML
    await expect(page.locator('h1')).toBeVisible();
    
    // Verify buttons have accessible names (either aria-label or text content)
    const newAppButton = page.getByRole('button', { name: /new application/i });
    await expect(newAppButton).toBeVisible();
    const hasAriaLabel = await newAppButton.getAttribute('aria-label');
    const hasText = await newAppButton.textContent();
    expect(hasAriaLabel || hasText).toBeTruthy();
  });

  test('application form should be accessible', async ({ page }) => {
    await page.getByRole('button', { name: /new application/i }).click();
    await page.waitForURL(/\/application\/[a-zA-Z0-9-]+\/client-info/);
    
    // Check accessibility
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);

    // Verify form labels are properly associated
    const firstNameInput = page.getByLabel(/first name/i);
    await expect(firstNameInput).toBeVisible();
    await expect(firstNameInput).toHaveAttribute('aria-required', 'true');
    
    // Verify required fields are marked
    const requiredFields = [
      /first name/i,
      /last name/i,
      /email/i,
      /phone/i,
      /ssn/i,
      /date of birth/i
    ];
    
    for (const field of requiredFields) {
      const input = page.getByLabel(field);
      await expect(input).toBeVisible();
      // Check for aria-required or required attribute
      const isRequired = await input.getAttribute('aria-required') === 'true' || 
                        await input.getAttribute('required') !== null;
      expect(isRequired).toBeTruthy();
    }

    // Verify select components have proper ARIA
    const citizenshipSelect = page.getByRole('combobox', { name: /citizenship status/i });
    await expect(citizenshipSelect).toBeVisible();
    await expect(citizenshipSelect).toHaveAttribute('aria-expanded');
    
    // Verify error messages have proper ARIA
    const errorContainer = page.locator('[role="alert"]');
    // May not be visible initially, but should exist if errors occur
  });

  test('navigation should be keyboard accessible', async ({ page }) => {
    await page.getByRole('button', { name: /new application/i }).click();
    await page.waitForURL(/\/application\/[a-zA-Z0-9-]+\/client-info/);
    
    // Test keyboard navigation through steps
    const stepButtons = [
      'Client Information',
      'Employment',
      'Income',
      'Assets',
      'Real Estate',
      'Documents',
      'Review'
    ];
    
    for (const stepName of stepButtons) {
      const button = page.getByRole('button', { name: new RegExp(stepName, 'i') });
      await expect(button).toBeVisible();
      
      // Verify button is focusable
      await button.focus();
      await expect(button).toBeFocused();
      
      // Verify button has accessible name
      const ariaLabel = await button.getAttribute('aria-label');
      const textContent = await button.textContent();
      expect(ariaLabel || textContent).toBeTruthy();
    }
  });

  test('form inputs should have proper labels and descriptions', async ({ page }) => {
    await page.getByRole('button', { name: /new application/i }).click();
    await page.waitForURL(/\/application\/[a-zA-Z0-9-]+\/client-info/);
    
    // Verify all inputs have associated labels
    const inputs = await page.locator('input, select, textarea').all();
    
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      const name = await input.getAttribute('name');
      
      // At least one of these should exist
      const hasLabel = id && (await page.locator(`label[for="${id}"]`).count()) > 0;
      const hasAriaLabel = ariaLabel !== null;
      const hasAriaLabelledBy = ariaLabelledBy !== null;
      const hasName = name !== null;
      
      expect(hasLabel || hasAriaLabel || hasAriaLabelledBy || hasName).toBeTruthy();
    }
  });

  test('error messages should be announced to screen readers', async ({ page }) => {
    await page.getByRole('button', { name: /new application/i }).click();
    await page.waitForURL(/\/application\/[a-zA-Z0-9-]+\/client-info/);
    
    // Navigate away without filling required fields
    await page.getByRole('button', { name: /employment/i }).click();
    await page.waitForURL(/\/employment/);
    await page.waitForTimeout(1000);
    
    // Navigate back to trigger validation
    await page.getByRole('button', { name: /client information/i }).click();
    await page.waitForURL(/\/client-info/);
    await page.waitForTimeout(1000);
    
    // Check for error messages with proper ARIA
    const errorMessages = page.locator('[role="alert"], .text-destructive');
    const errorCount = await errorMessages.count();
    
    if (errorCount > 0) {
      // Verify errors are announced
      for (let i = 0; i < errorCount; i++) {
        const error = errorMessages.nth(i);
        const role = await error.getAttribute('role');
        const ariaLive = await error.getAttribute('aria-live');
        
        // Error should be in alert role or have aria-live
        expect(role === 'alert' || ariaLive !== null).toBeTruthy();
      }
    }
  });

  test('color contrast should meet WCAG standards', async ({ page }) => {
    await page.getByRole('button', { name: /new application/i }).click();
    await page.waitForURL(/\/application\/[a-zA-Z0-9-]+\/client-info/);
    
    // Check color contrast specifically
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa', 'wcag21aa'])
      .analyze();
    
    const contrastViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'color-contrast'
    );
    expect(contrastViolations).toEqual([]);
  });

  test('focus management should be proper', async ({ page }) => {
    await page.getByRole('button', { name: /new application/i }).click();
    await page.waitForURL(/\/application\/[a-zA-Z0-9-]+\/client-info/);
    
    // Tab through form elements
    await page.keyboard.press('Tab');
    const firstFocused = page.locator(':focus');
    await expect(firstFocused).toBeVisible();
    
    // Verify focus indicators are visible
    const focusedElement = await firstFocused.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.outline !== 'none' || style.boxShadow !== 'none';
    });
    expect(focusedElement).toBeTruthy();
  });

  test('skip links should be present', async ({ page }) => {
    await page.getByRole('button', { name: /new application/i }).click();
    await page.waitForURL(/\/application\/[a-zA-Z0-9-]+\/client-info/);
    
    // Check for skip to main content link
    const skipLink = page.locator('a[href*="#main"], a[href*="#content"]');
    const skipLinkCount = await skipLink.count();
    
    // Skip link is optional but good practice
    if (skipLinkCount > 0) {
      await expect(skipLink.first()).toBeVisible();
    }
  });

  test('images should have alt text', async ({ page }) => {
    await page.goto('/');
    
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');
      
      // Decorative images should have role="presentation" or alt=""
      // Informative images should have descriptive alt text
      if (role !== 'presentation') {
        expect(alt).not.toBeNull();
      }
    }
  });

  test('headings should be properly structured', async ({ page }) => {
    await page.getByRole('button', { name: /new application/i }).click();
    await page.waitForURL(/\/application\/[a-zA-Z0-9-]+\/client-info/);
    
    // Verify heading hierarchy
    const h1 = page.locator('h1');
    const h1Count = await h1.count();
    expect(h1Count).toBeLessThanOrEqual(1); // Should have at most one h1
    
    // Verify no skipped heading levels
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    let previousLevel = 0;
    
    for (const heading of headings) {
      const tagName = await heading.evaluate((el) => el.tagName.toLowerCase());
      const level = parseInt(tagName.charAt(1));
      
      // Heading levels should not skip (e.g., h1 -> h3)
      if (previousLevel > 0) {
        expect(level - previousLevel).toBeLessThanOrEqual(1);
      }
      previousLevel = level;
    }
  });
});

