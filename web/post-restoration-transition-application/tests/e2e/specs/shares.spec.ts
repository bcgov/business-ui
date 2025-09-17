import { test, expect } from '@playwright/test'
import { mockForIdentifier } from '../test-utils/helpers'
import enI18n from '~~/i18n/locales/en-CA'

// Tests for validations introduced/updated in Shares AddEdit.vue (29620-stop-on-open-form related changes)
// Modeled after existing specs in tests/e2e/specs

test.describe('Shares Add/Edit shares form validations', () => {
  const identifier = 'CP1002605'

  test.beforeEach(async ({ page }) => {
    await mockForIdentifier(page, identifier)
  })

  test('Par value enabled requires Par Value and Currency until provided or No Par selected', async ({ page }) => {
    await page.goto(`./en-CA/${identifier}`)

    await page.getByTestId('add-share-button').click()
    await expect(page.locator('#shares-section-add-form')).toBeVisible()
    await page.getByPlaceholder(enI18n.label.shareName).fill('ParReq')

    // Enable Par Value (turn on)
    await page.getByTestId('parValue-radio').click()

    // Attempt to save while required fields are empty
    await page.getByTestId('addEditSharesDone').click()

    // Expect both Par Value and Currency errors
    await expect(page.getByText(enI18n.errors.parValue)).toBeVisible()
    await expect(page.getByText(enI18n.errors.currency)).toBeVisible()

    // Choose to switch to No Par to satisfy requirements alternatively
    await page.getByTestId('noParValue-radio').click()

    // ensure no par/currency errors remain visible
    await expect(page.getByText(enI18n.errors.parValue)).toHaveCount(0)
    await expect(page.getByText(enI18n.errors.currency)).toHaveCount(0)
  })

  test('Maximum Shares enabled requires a number until provided or No Max selected', async ({ page }) => {
    await page.goto(`./en-CA/${identifier}`)

    await page.getByTestId('add-share-button').click()
    await expect(page.locator('#shares-section-add-form')).toBeVisible()
    await page.getByTestId('maxShares-radio').click()
    await page.getByTestId('addEditSharesDone').click()

    // Expect the max shares error
    await expect(page.getByText(enI18n.errors.maxNumberOfShares)).toBeVisible()

    // type a valid number to clear the error
    await page.getByPlaceholder(enI18n.label.shareMaximumNumberOf).pressSequentially('100')

    // Expect the max shares error is gone
    await expect(page.getByText(enI18n.errors.maxNumberOfShares)).toBeHidden()

    await page.getByTestId('addEditSharesDone').click()
    await expect(page.getByText(enI18n.errors.maxNumberOfShares)).toHaveCount(0)
  })
})
