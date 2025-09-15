import { test, expect } from '@playwright/test'
import { scanA11y } from '../test-utils/a11y'

test.describe('Example', () => {
  // use saved login state
  // test.use({ storageState: 'tests/e2e/.auth/bcsc-user.json' })

  test('Passes', async ({ page }) => {
    await page.goto('./')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('TBD').first()).toBeVisible()
    // await scanA11y(page)
  })
})
