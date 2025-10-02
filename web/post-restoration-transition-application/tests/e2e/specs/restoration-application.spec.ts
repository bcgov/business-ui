import { test, expect } from '@playwright/test'
import { impersonateUser, mockForIdentifier } from '../test-utils/helpers'
import enI18n from '~~/i18n/locales/en-CA'

test.describe('Post restoration Transition Application Filing', () => {
  const identifier = 'CP1002605'
  test.beforeEach(async ({ page }) => {
    await impersonateUser(page, 'business')
    await mockForIdentifier(page, identifier)
  })
  // use saved login state
  // test.use({ storageState: 'tests/e2e/.auth/bcsc-user.json' })

  test('All sections here', async ({ page }) => {
    await page.goto(`./en-CA/${identifier}`)
    await expect(page.getByText('Post Restoration Transition Application').first()).toBeVisible()

    await expect(page.getByText('1. ' + enI18n.transitionApplication.subtitle.reviewAndConfirm)).toBeVisible()
    await expect(page.getByText('2. ' + enI18n.transitionApplication.subtitle.documentDelivery)).toBeVisible()
    await expect(page.getByText('3. ' + enI18n.transitionApplication.subtitle.folio)).toBeVisible()
    await expect(page.getByText('4. ' + enI18n.transitionApplication.subtitle.companyProvisions)).toBeVisible()
    await expect(page.getByText('5. ' + enI18n.transitionApplication.subtitle.certify)).toBeVisible()
  })
})
