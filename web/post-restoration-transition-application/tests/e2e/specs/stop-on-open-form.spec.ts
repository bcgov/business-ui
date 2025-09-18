import { test, expect } from '@playwright/test'
import { mockForIdentifier } from '../test-utils/helpers'
import enI18n from '~~/i18n/locales/en-CA'

// This spec validates the behaviour introduced in 29620-stop-on-open-form:
// - If a form is open, attempting other changes should scroll to the open form and show an error
// - If a form is open, attempting to Submit should scroll to the open form and show a submit-specific error

test.describe('Stop-on-open-form behaviour', () => {
  const identifier = 'CP1002605'

  test.beforeEach(async ({ page }) => {
    await mockForIdentifier(page, identifier)
  })

  test('Shows error when trying to open another form while articles is open ', async ({ page }) => {
    await page.goto(`./en-CA/${identifier}`)

    // Open the Articles Date input form
    const addDateBtn = page.getByTestId('add-date-button')
    await expect(addDateBtn).toBeVisible()
    await addDateBtn.click()

    // While Articles form is open, try to add a Share
    const addShareBtn = page.getByTestId('add-share-button')
    await expect(addShareBtn).toBeVisible()
    await addShareBtn.click()

    // Expect the generic open-form error to be shown ("other changes")
    await expect(page.getByText(enI18n.errors.closeOpenFormBeforeOtherChanges)).toBeVisible()

    // Ensure the Shares Add/Edit form did not open
    const sharesForms = page.locator('#shares-section-edit-form')
    // this is due to the add/shares is on v-show instead of v-if
    await expect(sharesForms).toBeHidden()

    // Close the Articles form (Cancel)
    const cancelBtn = page.getByTestId('articles-current-date-edit-form_cancel')
    await expect(cancelBtn).toBeVisible()
    await cancelBtn.click()

    // The error message should disappear after closing the only open form
    await expect(page.getByText(enI18n.errors.closeOpenFormBeforeOtherChanges)).toHaveCount(0)
  })

  test('Shows error when trying to open another form while shares is open ', async ({ page }) => {
    await page.goto(`./en-CA/${identifier}`)

    // Open the Articles Date input form
    const addShareBtn = page.getByTestId('add-share-button')
    await expect(addShareBtn).toBeVisible()
    await addShareBtn.click()

    // While Shares is open, try to open Articles date input
    const addDateBtn = page.getByTestId('add-date-button')
    await expect(addDateBtn).toBeVisible()
    await addDateBtn.click()

    // Expect the generic open-form error to be shown ("other changes")
    await expect(page.getByText(enI18n.errors.closeOpenFormBeforeOtherChanges)).toBeVisible()

    // Ensure the Articles date input did not open
    const sharesForms = page.locator('#articles-current-date-edit-form')
    await expect(sharesForms).toBeHidden()

    // Close the shares form (Cancel)
    const cancelBtn = page.getByTestId('addEditSharesCancel')
    await expect(cancelBtn).toBeVisible()
    await cancelBtn.click()

    // The error message should disappear after closing the only open form
    await expect(page.getByText(enI18n.errors.closeOpenFormBeforeOtherChanges)).toHaveCount(0)
  })

  test('Shows error when trying to open another form while address change is open ', async ({ page }) => {
    await page.goto(`./en-CA/${identifier}`)

    // Open the director address change form
    const addressChangeBtn = page.getByTestId('change-director-address-button')
    await expect(addressChangeBtn).toBeVisible()
    await addressChangeBtn.click()

    // While director address change form is open, try to add a Share
    const addShareBtn = page.getByTestId('add-share-button')
    await expect(addShareBtn).toBeVisible()
    await addShareBtn.click()

    // Expect the generic open-form error to be shown ("other changes")
    await expect(page.getByText(enI18n.errors.closeOpenFormBeforeOtherChanges)).toBeVisible()

    // Ensure the Shares Add/Edit form did not open
    const sharesForms = page.locator('#shares-section-edit-form')
    // this is due to the add/shares is on v-show instead of v-if
    await expect(sharesForms).toBeHidden()

    // Close the Articles form (Cancel)
    const cancelBtn = page.getByTestId('directorChangeAddressCancelBtn')
    await expect(cancelBtn).toBeVisible()
    await cancelBtn.click()

    // The error message should disappear after closing the only open form
    await expect(page.getByText(enI18n.errors.closeOpenFormBeforeOtherChanges)).toHaveCount(0)
  })

  test('Blocks Submit and shows submit-specific error when a form is open', async ({ page }) => {
    await page.goto(`./en-CA/${identifier}`)

    // Open the directors address change form
    const articlesAddBtn = page.getByTestId('add-date-button').first()
    await expect(articlesAddBtn).toBeVisible()
    await articlesAddBtn.click()

    // Verify the aricles date input form is visible
    const articlesForm = page.locator('#articles-current-date-edit-form')
    await expect(articlesForm).toBeVisible()

    // Attempt to Submit while form is open
    const submitBtn = page.getByTestId('submit-button')
    await expect(submitBtn).toBeVisible()
    await submitBtn.click()

    // Expect the submit-specific open-form error message to be shown
    await expect(page.getByText(enI18n.errors.closeOpenFormBeforeSubmitting)).toBeVisible()

    // Close the Articles input form via Cancel button
    const articlesCancelBtn = page.getByTestId('articles-current-date-edit-form_cancel')
    await expect(articlesCancelBtn).toBeVisible()
    await articlesCancelBtn.click()

    // The submit-specific error should disappear after closing the form
    await expect(page.getByText(enI18n.errors.closeOpenFormBeforeSubmitting)).toHaveCount(0)
  })
})
