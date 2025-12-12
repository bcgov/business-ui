import { test, expect } from '@playwright/test'
import { ActionType } from '#business/app/enums/action-type'
import { ReceiverType } from '#business/app/enums/receiver-type'
import { RoleType } from '#business/app/enums/role-type'
import { mockApiCallsForFiling, navigateToManageReceiversPage } from '../../test-utils'

const identifier = 'BC1234567'

test.describe('Manage Receivers - Submission', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiCallsForFiling(page, identifier, 'Receiver')
  })

  test.describe('Happy paths', () => {
    test('appointReceiver', async ({ page }) => {
      await navigateToManageReceiversPage(page, ReceiverType.APPOINT)
      await page.waitForLoadState('networkidle')
      const address = {
        streetAddress: 'street',
        streetAddressAdditional: '',
        addressCity: 'city',
        addressCountry: 'CA',
        addressRegion: 'BC',
        deliveryInstructions: '',
        postalCode: 'V1N 4H8'
      }
      const newReceiver = {
        actions: [ActionType.ADDED],
        entity: {
          businessName: '',
          familyName: 'last name',
          givenName: 'first name',
          identifier: '',
          middleInitial: ''
        },
        deliveryAddress: address,
        mailingAddress: address,
        roles: [{ roleType: RoleType.RECEIVER }]
      }
      const innerPayload: ReceiverPayload = {
        relationships: [newReceiver],
        type: ReceiverType.APPOINT
      }

      const addButton = page.getByRole('button', { name: 'Add Receiver' })
      expect(addButton).toBeVisible()
      await addButton.click()
      // FUTURE: add common party form fill out in base layer and use that
      const firstNameInput = page.getByTestId('first-name-input')
      const lastNameInput = page.getByTestId('last-name-input')
      const streetInput = page.getByTestId('delivery-address-input-street')
      const cityInput = page.getByTestId('delivery-address-input-city')
      const provinceSelect = page.getByTestId('delivery-address-input-region')
      const postalCodeInput = page.getByTestId('delivery-address-input-postalCode')
      const sameAsCheckbox = page.getByRole('checkbox', { name: 'Same as Delivery Address' })
      const doneBtn = page.getByRole('button', { name: 'Done' })
      expect(firstNameInput).toBeVisible()
      await firstNameInput.fill(newReceiver.entity.givenName)
      expect(lastNameInput).toBeVisible()
      await lastNameInput.fill(newReceiver.entity.familyName)
      expect(streetInput).toBeVisible()
      await streetInput.fill(newReceiver.deliveryAddress.streetAddress)
      expect(cityInput).toBeVisible()
      await cityInput.fill(newReceiver.deliveryAddress.addressCity)
      expect(provinceSelect).toBeVisible()
      await provinceSelect.click()
      await page.getByRole('option', { name: 'British Columbia' }).click()
      expect(postalCodeInput).toBeVisible()
      await postalCodeInput.fill(newReceiver.deliveryAddress.postalCode)
      expect(sameAsCheckbox).toBeVisible()
      await sameAsCheckbox.click()
      expect(doneBtn).toBeVisible()
      await doneBtn.click()
      // FUTURE: add common staff payment form fill out in base and use that
      const staffNoFeeRadio = page.getByRole('radio', { name: 'No Fee' })
      expect(staffNoFeeRadio).toBeVisible()
      await staffNoFeeRadio.click()

      const submitBtn = page.getByRole('button', { name: 'Submit' })
      expect(submitBtn).toBeVisible()
      const submitRequest = page.waitForRequest(`**/businesses/${identifier}/filings`, { timeout: 10000 })
      await submitBtn.click()
      const request = await submitRequest
      const requestBody = request.postDataJSON() as FilingSubmissionBody<{ changeOfReceivers: ReceiverPayload }>
      expect(requestBody.filing.changeOfReceivers).toEqual(innerPayload)
    })
  })
})
