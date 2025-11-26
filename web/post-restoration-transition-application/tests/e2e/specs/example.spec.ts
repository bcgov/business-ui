import { test, expect } from '@playwright/test'
import { CP1002605 } from '../../mocks/lear/business'
import { impersonateUser, mockForIdentifier } from '../test-utils/helpers'

test.describe('Example', () => {
  const identifier = CP1002605.business.identifier
  test.beforeEach(async ({ page }) => {
    await impersonateUser(page, 'business')
    await mockForIdentifier(page, identifier)
  })
  test('Passes', async ({ page }) => {
    await page.goto(`./en-CA/${identifier}`)
    await expect(page.getByRole('heading', { name: 'Post Restoration Transition Application' })).toBeVisible()
  })
})
