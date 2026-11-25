import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

import { mockApiCallsForSetAccount } from '#test-mocks/mock-helpers'

function getElements(page: Page) {
  const staffToggle = page.getByRole('checkbox', { name: 'Staff filing on behalf of a client' })
  const authorizationSection = page.getByTestId('confirm-authorization-section')
  const completingPartySection = page.getByTestId('completing-party-section')
  const completingPartyInput = page.getByLabel('Legal name of completing party')
  const completingPartyError = completingPartySection.getByText(
    'Please enter the full legal name of the completing party'
  )
  const authorizationError = authorizationSection.locator('legend').getByText('Check this box to continue')
  const nonStaffCheckbox = page.getByRole('checkbox', { name: /^I confirm that the information provided/ })
  const staffCheckbox = page.getByRole('checkbox', { name: /confirms that the information provided/ })
  const doneButton = page.getByRole('button', { name: 'Done' })

  return {
    staffToggle,
    authorizationSection,
    completingPartySection,
    completingPartyInput,
    completingPartyError,
    authorizationError,
    nonStaffCheckbox,
    staffCheckbox,
    doneButton
  }
}

function waitForSubmit(page: Page) {
  // the playground logs the submitted form data on a successful submit
  return page.waitForEvent('console', msg => msg.text().startsWith('Form data'))
}

test.describe('FormConfirmAuthorization', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiCallsForSetAccount(page)
    await page.goto('./en-CA/examples/components/Form/ConfirmAuthorization/default')
    await page.waitForLoadState('networkidle')
  })

  test.describe('default (non-staff) variant', () => {
    test('Should render the authorization section without the completing party field', async ({ page }) => {
      const { authorizationSection, completingPartySection, completingPartyInput } = getElements(page)

      await expect(authorizationSection).toBeVisible()
      await expect(completingPartySection).toHaveCount(0)
      await expect(completingPartyInput).toHaveCount(0)

      await expect(page.getByText(
        'Confirm your authorization to complete and submit this filing. The name of the person submitting '
        + 'this filing will be displayed in the history of filings for this Corporation.'
      )).toBeVisible()

      await expect(page.getByRole('checkbox', {
        name: 'I confirm that the information provided is correct and that I am authorized to submit this '
          + 'filing on behalf of the Corporation.'
      })).toBeVisible()
    })

    test('Should number the authorization heading with the given order', async ({ page }) => {
      await expect(page.getByRole('heading', { name: '1. Authorization', exact: true })).toBeVisible()
    })

    test('Should show the date in bold long format', async ({ page }) => {
      const { authorizationSection } = getElements(page)
      const date = authorizationSection.locator('div.font-bold', { hasText: /^Date:/ })

      await expect(date).toBeVisible()
      await expect(date).toHaveText(/^Date: [A-Z][a-z]+ \d{1,2}, \d{4}$/)
    })

    test('Should italicize the Act name in the offence note', async ({ page }) => {
      const { authorizationSection } = getElements(page)

      await expect(
        authorizationSection.getByText('It is an offence to make a false or misleading statement')
      ).toBeVisible()
      await expect(authorizationSection.locator('em', { hasText: 'Business Corporations Act' })).toBeVisible()
    })

    test('Should require the checkbox on submit', async ({ page }) => {
      const { doneButton, authorizationError } = getElements(page)

      await doneButton.click()
      await expect(authorizationError).toBeVisible()
    })

    test('Should clear the error and submit once checked', async ({ page }) => {
      const { doneButton, authorizationError, nonStaffCheckbox } = getElements(page)

      await doneButton.click()
      await expect(authorizationError).toBeVisible()

      await nonStaffCheckbox.check()
      const submitted = waitForSubmit(page)
      await doneButton.click()
      await submitted

      await expect(authorizationError).toHaveCount(0)
    })
  })

  test.describe('staff variant (show-completing-party)', () => {
    test.beforeEach(async ({ page }) => {
      await getElements(page).staffToggle.check()
    })

    test('Should render the completing party field above the authorization section', async ({ page }) => {
      const { completingPartySection, completingPartyInput } = getElements(page)

      await expect(completingPartySection).toBeVisible()
      await expect(completingPartyInput).toBeVisible()

      const completingBox = await completingPartySection.boundingBox()
      const authorizationBox = await page.getByTestId('confirm-authorization-section').boundingBox()
      expect(completingBox!.y).toBeLessThan(authorizationBox!.y)
    })

    test('Should use the completing party wording', async ({ page }) => {
      await expect(page.getByText(
        'Confirm the completing party’s authorization to complete and submit this filing. The name of the '
        + 'person submitting this filing will be displayed in the history of filings for this Corporation.'
      )).toBeVisible()

      await expect(page.getByRole('checkbox', {
        name: '[Completing Party] confirms that the information provided is correct and that they are '
          + 'authorized to submit this filing on behalf of the Corporation.'
      })).toBeVisible()
    })

    test('Should number both sections consecutively', async ({ page }) => {
      await expect(page.getByRole('heading', { name: '1. Completing Party', exact: true })).toBeVisible()
      await expect(page.getByRole('heading', { name: '2. Authorization', exact: true })).toBeVisible()
    })

    test('Should interpolate the name into the checkbox label and fall back when blank', async ({ page }) => {
      const { completingPartyInput } = getElements(page)

      await completingPartyInput.fill('Jane Smith')
      await expect(page.getByRole('checkbox', {
        name: 'Jane Smith confirms that the information provided is correct and that they are authorized '
          + 'to submit this filing on behalf of the Corporation.'
      })).toBeVisible()

      await completingPartyInput.fill('   ')
      await expect(page.getByRole('checkbox', { name: /^\[Completing Party\] confirms/ })).toBeVisible()
    })

    test('Should require both the name and the checkbox on submit', async ({ page }) => {
      const { doneButton, completingPartyError, authorizationError } = getElements(page)

      await doneButton.click()

      await expect(completingPartyError).toHaveCount(1)
      await expect(completingPartyError).toBeVisible()
      await expect(authorizationError).toBeVisible()
    })

    test('Should still require the name when only the checkbox is checked', async ({ page }) => {
      const { doneButton, completingPartyError, authorizationError, staffCheckbox } = getElements(page)

      await staffCheckbox.check()
      await doneButton.click()

      await expect(completingPartyError).toBeVisible()
      await expect(authorizationError).toHaveCount(0)
    })

    test('Should submit once the name is entered and the checkbox is checked', async ({ page }) => {
      const { doneButton, completingPartyInput, completingPartyError, authorizationError, staffCheckbox }
        = getElements(page)

      await completingPartyInput.fill('Jane Smith')
      await staffCheckbox.check()

      const submitted = waitForSubmit(page)
      await doneButton.click()
      await submitted

      await expect(completingPartyError).toHaveCount(0)
      await expect(authorizationError).toHaveCount(0)
    })

    test('Should hide the completing party field again when toggled off', async ({ page }) => {
      const { staffToggle, completingPartySection, nonStaffCheckbox } = getElements(page)

      await staffToggle.uncheck()

      await expect(completingPartySection).toHaveCount(0)
      await expect(page.getByRole('heading', { name: '1. Authorization', exact: true })).toBeVisible()
      await expect(nonStaffCheckbox).toBeVisible()
    })
  })
})
