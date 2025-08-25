import { test, expect } from '@playwright/test'
import { entityCP1002605 } from '../../mocks/auth/entities'
import { businessCP1002605 } from '../../mocks/lear/business'

test.describe('Example', () => {
  const identifier = businessCP1002605.business.identifier
  test.beforeEach(async ({ page }) => {
    await page.route(`*/**/entities/${identifier}`, async (route) => {
      await route.fulfill({ json: entityCP1002605 })
    })
    await page.route(`*/**/businesses/${identifier}?slim=true`, async (route) => {
      await route.fulfill({ json: businessCP1002605 })
    })
  })
  test('Passes', async ({ page }) => {
    await page.goto(`./en-CA/${identifier}`)
    await expect(page.getByRole('heading', { name: 'Post Restoration Transition Application' })).toBeVisible()
  })
})
