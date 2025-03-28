import { test, expect } from '@playwright/test'
import { scanA11y } from '../test-utils/a11y'

test.describe('Example', () => {
  test('Passes', async ({ page }) => {
    await page.goto('./')
    await expect(page.getByText('TBD')).toBeVisible()

    await scanA11y(page)
  })
})
