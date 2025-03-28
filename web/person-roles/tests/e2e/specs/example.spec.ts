import { test, expect } from '@playwright/test'

test.describe('Example', () => {
  test('Passes', async ({ page }) => {
    await page.goto('./')
    await expect(page.getByText('TBD')).toBeVisible()
  })
})
