import { test, expect } from '@playwright/test'

test('ApplicationProgress visible on application page', async ({ page }) => {
  await page.goto('/application/client-info')
  await expect(page.getByText(/Overall Progress/i)).toBeVisible()
})
