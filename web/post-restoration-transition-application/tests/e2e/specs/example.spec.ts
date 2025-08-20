import { test, expect } from '@playwright/test'
// import { scanA11y } from '../test-utils/a11y'
import { entityCP1002605 } from '../../mocks/auth/entities'
import { businessCP1002605 } from '../../mocks/lear/business'

test.describe('Example', () => {
  // use saved login state
  // test.use({ storageState: 'tests/e2e/.auth/bcsc-user.json' })
  test.beforeEach(async ({ page }) => {
    await page.route('*/**/entities/CP1002605', async (route) => {
      await route.fulfill({ json: entityCP1002605 })
    })
    await page.route('*/**/businesses/CP1002605?slim=true', async (route) => {
      await route.fulfill({ json: businessCP1002605 })
    })
  })
  test('Passes', async ({ page }) => {
    await page.goto('./en-CA/CP1002605')
    await expect(page.getByRole('heading', { name: 'Post Restoration Transition Application' })).toBeVisible()
    // await scanA11y(page)
  })
})
