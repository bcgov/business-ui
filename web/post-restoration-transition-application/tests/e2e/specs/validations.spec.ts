import { test, expect } from '@playwright/test'
import enI18n from '~~/i18n/locales/en-CA'

test.describe('Post restoration Transition Application Filing', () => {
  // use saved login state
  test.use({ storageState: 'tests/e2e/.auth/bcsc-user.json' })

  test('All sections here', async ({ page }) => {
    await page.goto('./en-CA/CP1002605')
    

    await expect(page.getByTestId('legalName-input')).toBeVisible()
    await expect(page.getByTestId('compPartyEmail-input')).toBeVisible()
    await expect(page.getByTestId('courtOrderNumber-input')).toBeVisible()
    await expect(page.getByTestId('folio-input')).toBeVisible()
  })
})
