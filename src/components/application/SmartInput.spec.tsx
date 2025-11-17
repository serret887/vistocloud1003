import { test, expect } from '@playwright/test'

test('Application form shows footer actions and autosave label', async ({ page }) => {
  await page.goto('/application/client-info')
  await expect(page.getByText(/Auto-save:/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /Next/i })).toBeVisible()
})
