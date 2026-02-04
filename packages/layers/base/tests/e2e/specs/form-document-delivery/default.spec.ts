import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

function getElements(page: Page) {
  const form = page.locator('form')
  const firstNameInput = form.getByLabel('First Name')
  const middleNameInput = form.getByLabel('Middle Name')
  const lastNameInput = form.getByLabel('Last Name')
  const emailInput = form.getByLabel('Email Address (Optional)')
  const docDeliverySection = form.getByTestId('document-delivery-section')
  const doneButton = form.getByRole('button', { name: 'Done' })
  const cancelButton = form.getByRole('button', { name: 'Cancel' })

  return {
    form,
    firstNameInput,
    middleNameInput,
    lastNameInput,
    emailInput,
    docDeliverySection,
    doneButton,
    cancelButton
  }
}

test.describe('FormDocumentDelivery', () => {
  test('form interactions', async ({ page }) => {
    await page.goto('./en-CA/examples/components/Form/DocumentDelivery')
    await page.waitForLoadState('networkidle')

    const {
      form,
      firstNameInput,
      middleNameInput,
      lastNameInput,
      emailInput,
      docDeliverySection,
      doneButton,
      cancelButton
    } = getElements(page)

    await expect(form).toBeVisible()

    // fill name fields so they're valid
    await firstNameInput.fill('first')
    await middleNameInput.fill('middle')
    await lastNameInput.fill('last')

    await doneButton.click()

    // form should submit successfully with no email
    const submittedNoEmail = page.getByTestId('submitted-data')
    await expect(submittedNoEmail).toContainText('"first": "first"')
    await expect(submittedNoEmail).toContainText('"docDelivery": {}')

    // reset form inputs and submitted data pre block
    await cancelButton.click()
    await expect(page.getByTestId('submitted-data')).not.toBeVisible()

    // refill name fields
    await firstNameInput.fill('first')
    await middleNameInput.fill('middle')
    await lastNameInput.fill('last')

    // fill invalid email
    await emailInput.fill('invalid-email')

    // try to submit
    await doneButton.click()

    // should not have submitted and display error message
    await expect(page.getByTestId('submitted-data')).not.toBeVisible()
    await expect(docDeliverySection).toContainText('Enter a valid email address')

    // enter valid email and submit form
    await emailInput.fill('email@example.com')
    await doneButton.click()
    await expect(docDeliverySection).not.toContainText('Enter a valid email address')
    const submittedWithEmail = page.getByTestId('submitted-data')
    await expect(submittedWithEmail).toBeVisible()
    await expect(submittedWithEmail).toContainText('"first": "first"')
    await expect(submittedWithEmail).toContainText('"docDelivery": { "completingPartyEmail": "email@example.com" }')
  })
})
