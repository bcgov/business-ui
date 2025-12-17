import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { ActionType } from '#business/app/enums/action-type'
import { ReceiverType } from '#business/app/enums/receiver-type'
import { RoleType } from '#business/app/enums/role-type'
import type { ApiAddress } from '#business/app/interfaces/address'
import type { BusinessEntity, BusinessRelationship } from '#business/app/interfaces/business-relationship'
import { mockCommonApiCallsForFiling, getPartiesMock } from '#testMocks'
import { navigateToManageReceiversPage } from '../../test-utils'

const identifier = 'BC1234567'

async function fillOutAddress(page: Page, address: ApiAddress, type = 'delivery', sameAs = true) {
  const streetInput = page.getByTestId(`${type}-address-input-street`)
  const cityInput = page.getByTestId(`${type}-address-input-city`)
  const provinceSelect = page.getByTestId(`${type}-address-input-region`)
  const postalCodeInput = page.getByTestId(`${type}-address-input-postalCode`)
  const sameAsCheckbox = page.getByRole('checkbox', { name: 'Same as Delivery Address' })
  expect(streetInput).toBeVisible()
  await streetInput.fill(address.streetAddress)
  expect(cityInput).toBeVisible()
  await cityInput.fill(address.addressCity)
  expect(provinceSelect).toBeVisible()
  await provinceSelect.click()
  await page.getByRole('option', { name: 'British Columbia' }).click()
  expect(postalCodeInput).toBeVisible()
  await postalCodeInput.fill(address.postalCode)
  if (sameAs) {
    expect(sameAsCheckbox).toBeVisible()
    await sameAsCheckbox.click()
  }
}
async function fillOutName(page: Page, entity: Partial<BusinessEntity>) {
  // FUTURE: add common party form fill out in base layer and use that
  const firstNameInput = page.getByTestId('first-name-input')
  const lastNameInput = page.getByTestId('last-name-input')
  expect(firstNameInput).toBeVisible()
  await firstNameInput.fill(entity.givenName!)
  expect(lastNameInput).toBeVisible()
  await lastNameInput.fill(entity.familyName!)
}
async function selectDone(page: Page) {
  const doneBtn = page.getByRole('button', { name: 'Done' })
  expect(doneBtn).toBeVisible()
  await doneBtn.click()
}
async function fillOutNewRelationship(page: Page, relationship: BusinessRelationship) {
  // FUTURE: add common party form fill out in base layer and use that
  await fillOutName(page, relationship.entity)
  await fillOutAddress(page, relationship.deliveryAddress)
  await selectDone(page)
}

test.describe('Manage Receivers - Submission', () => {
  test.beforeEach(async ({ page }) => {
    await mockCommonApiCallsForFiling(
      page,
      identifier,
      getPartiesMock([
        { index: 0, key: 'roleType', value: 'Receiver' },
        { index: 1, key: 'roleType', value: 'Receiver' },
        { index: 2, key: 'roleType', value: 'Receiver' }
      ]),
      undefined
    )
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
      await fillOutNewRelationship(page, newReceiver)
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

    test('ceaseReceiver', async ({ page }) => {
      await navigateToManageReceiversPage(page, ReceiverType.CEASE)
      await page.waitForLoadState('networkidle')
      const existingReceiver = page.getByRole('table').locator('tbody').getByRole('row').first()
      expect(existingReceiver).toBeVisible()
      const moreActionsBtn = existingReceiver.getByRole('button', { name: 'More Actions' })
      expect(moreActionsBtn).toBeVisible()
      await moreActionsBtn.click()
      await page.getByRole('menuitem', { name: 'Remove' }).click()
      const staffNoFeeRadio = page.getByRole('radio', { name: 'No Fee' })
      expect(staffNoFeeRadio).toBeVisible()
      await staffNoFeeRadio.click()

      const submitBtn = page.getByRole('button', { name: 'Submit' })
      expect(submitBtn).toBeVisible()
      const submitRequest = page.waitForRequest(`**/businesses/${identifier}/filings`, { timeout: 10000 })
      await submitBtn.click()
      const request = await submitRequest
      const requestBody = request.postDataJSON() as FilingSubmissionBody<{ changeOfReceivers: ReceiverPayload }>
      expect(requestBody.filing.changeOfReceivers.type).toBe(ReceiverType.CEASE)
      expect(requestBody.filing.changeOfReceivers.relationships.length).toBe(1)
      expect(requestBody.filing.changeOfReceivers.relationships[0]?.actions).toEqual([ActionType.REMOVED])
      expect(requestBody.filing.changeOfReceivers.relationships[0]?.roles.length).toBe(1)
      expect(requestBody.filing.changeOfReceivers.relationships[0]?.roles[0]?.cessationDate).toBeDefined()
    })

    test('changeAddressReceiver', async ({ page }) => {
      await navigateToManageReceiversPage(page, ReceiverType.ADDRESS)
      await page.waitForLoadState('networkidle')
      const newAddress: ApiAddress = {
        streetAddress: 'changed street',
        streetAddressAdditional: '',
        addressCity: 'newCity',
        addressCountry: 'CA',
        addressRegion: 'BC',
        deliveryInstructions: '',
        postalCode: 'V1N 4H8'
      }
      const existingReceiver = page.getByRole('table').locator('tbody').getByRole('row').first()
      expect(existingReceiver).toBeVisible()
      const changeBtn = existingReceiver.getByRole('button', { name: 'Change' })
      expect(changeBtn).toBeVisible()
      await changeBtn.click()
      await fillOutAddress(page, newAddress)
      await selectDone(page)
      const staffNoFeeRadio = page.getByRole('radio', { name: 'No Fee' })
      expect(staffNoFeeRadio).toBeVisible()
      await staffNoFeeRadio.click()

      const submitBtn = page.getByRole('button', { name: 'Submit' })
      expect(submitBtn).toBeVisible()
      const submitRequest = page.waitForRequest(`**/businesses/${identifier}/filings`, { timeout: 10000 })
      await submitBtn.click()
      const request = await submitRequest
      const requestBody = request.postDataJSON() as FilingSubmissionBody<{ changeOfReceivers: ReceiverPayload }>
      expect(requestBody.filing.changeOfReceivers.type).toBe(ReceiverType.ADDRESS)
      expect(requestBody.filing.changeOfReceivers.relationships.length).toBe(1)
      expect(requestBody.filing.changeOfReceivers.relationships[0]?.actions).toEqual([ActionType.ADDRESS_CHANGED])
      expect(requestBody.filing.changeOfReceivers.relationships[0]?.deliveryAddress).toEqual(newAddress)
    })
    test('amendReceiver', async ({ page }) => {
      await navigateToManageReceiversPage(page, ReceiverType.AMEND)
      await page.waitForLoadState('networkidle')
      const newAddress = {
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
        deliveryAddress: newAddress,
        mailingAddress: newAddress,
        roles: [{ roleType: RoleType.RECEIVER }]
      }
      const changeAddress: ApiAddress = {
        streetAddress: 'changed street',
        streetAddressAdditional: '',
        addressCity: 'newCity',
        addressCountry: 'CA',
        addressRegion: 'BC',
        deliveryInstructions: '',
        postalCode: 'V1N 4H8'
      }
      const changeName: Partial<BusinessEntity> = {
        givenName: 'changed first name',
        familyName: 'changed last name'
      }
      const existingReceivers = await page.getByRole('table').locator('tbody').getByRole('row').all()
      expect(existingReceivers.length).toBe(3)
      const changeAddressReceiver = existingReceivers[0]!
      const changeNameReceiver = existingReceivers[1]!
      const ceaseReceiver = existingReceivers[2]!
      // change address
      expect(changeAddressReceiver).toBeVisible()
      const changeBtn1 = changeAddressReceiver.getByRole('button', { name: 'Change' })
      expect(changeBtn1).toBeVisible()
      await changeBtn1.click()
      await fillOutAddress(page, changeAddress)
      await selectDone(page)
      // change name
      expect(changeNameReceiver).toBeVisible()
      const changeBtn2 = changeNameReceiver.getByRole('button', { name: 'Change' })
      expect(changeBtn2).toBeVisible()
      await changeBtn2.click()
      await fillOutName(page, changeName)
      await selectDone(page)
      // cease
      expect(ceaseReceiver).toBeVisible()
      const moreActionsBtn = ceaseReceiver.getByRole('button', { name: 'More Actions' })
      expect(moreActionsBtn).toBeVisible()
      await moreActionsBtn.click()
      await page.getByRole('menuitem', { name: 'Remove' }).click()
      // add new
      const addButton = page.getByRole('button', { name: 'Add Receiver' })
      expect(addButton).toBeVisible()
      await addButton.click()
      await fillOutNewRelationship(page, newReceiver)
      // staff pay
      const staffNoFeeRadio = page.getByRole('radio', { name: 'No Fee' })
      expect(staffNoFeeRadio).toBeVisible()
      await staffNoFeeRadio.click()

      const submitBtn = page.getByRole('button', { name: 'Submit' })
      expect(submitBtn).toBeVisible()
      const submitRequest = page.waitForRequest(`**/businesses/${identifier}/filings`, { timeout: 10000 })
      await submitBtn.click()
      const request = await submitRequest
      const requestBody = request.postDataJSON() as FilingSubmissionBody<{ changeOfReceivers: ReceiverPayload }>
      expect(requestBody.filing.changeOfReceivers.type).toBe(ReceiverType.AMEND)
      expect(requestBody.filing.changeOfReceivers.relationships.length).toBe(4)
      expect(requestBody.filing.changeOfReceivers.relationships[0]?.actions).toEqual([ActionType.ADDRESS_CHANGED])
      expect(requestBody.filing.changeOfReceivers.relationships[1]?.actions).toEqual([ActionType.NAME_CHANGED])
      expect(requestBody.filing.changeOfReceivers.relationships[2]?.actions).toEqual([ActionType.REMOVED])
      expect(requestBody.filing.changeOfReceivers.relationships[3]?.actions).toEqual([ActionType.ADDED])
    })
  })
})
