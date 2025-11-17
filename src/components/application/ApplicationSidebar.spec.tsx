import { test, expect } from '@playwright/test'

test('ApplicationSidebar shows progress and step links', async ({ page }) => {
  await page.goto('/application/client-info')
  await expect(page.getByText(/Overall Progress/i)).toBeVisible()
  await expect(page.getByRole('link', { name: /Client Information/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /Documents/i })).toBeVisible()
})
