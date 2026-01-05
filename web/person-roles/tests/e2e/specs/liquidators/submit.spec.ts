import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { ActionType } from '#business/app/enums/action-type'
import { LiquidateType } from '#business/app/enums/liquidate-type'
import { RoleType } from '#business/app/enums/role-type'
import type { ApiAddress } from '#business/app/interfaces/address'
import type { BusinessEntity, BusinessRelationship } from '#business/app/interfaces/business-relationship'
import { mockCommonApiCallsForFiling, getPartiesMock, getBusinessAddressesMock } from '#test-mocks'
import { navigateToManageLiquidatorsPage } from '../../test-utils'

const identifier = 'BC1234567'

async function fillOutAddress(page: Page, address: ApiAddress, type = 'delivery', sameAs = true) {
  const streetInput = page.getByTestId(`${type}-address-input-street`).first()
  const cityInput = page.getByTestId(`${type}-address-input-city`).first()
  const provinceSelect = page.getByTestId(`${type}-address-input-region`).first()
  const postalCodeInput = page.getByTestId(`${type}-address-input-postalCode`).first()
  const sameAsCheckbox = page.getByRole('checkbox', { name: 'Same as Delivery Address' }).first()
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

test.describe('Manage Liquidators - Submission', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2025-12-30'))

    await mockCommonApiCallsForFiling(
      page,
      identifier,
      getPartiesMock([
        { index: 0, key: 'roleType', value: 'Liquidator' },
        { index: 1, key: 'roleType', value: 'Liquidator' },
        { index: 2, key: 'roleType', value: 'Liquidator' }
      ]),
      undefined,
      getBusinessAddressesMock()
    )
  })

  test.describe('Happy paths', () => {
    test('intentToLiquidate', async ({ page }) => {
      await navigateToManageLiquidatorsPage(page, LiquidateType.INTENT)
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
      const newLiquidator = {
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
        roles: [{ roleType: RoleType.LIQUIDATOR }]
      }
      const innerPayload: LiquidatorPayload = {
        relationships: [newLiquidator],
        type: LiquidateType.INTENT,
        offices: {
          liquidationRecordsOffice: {
            mailingAddress: address,
            deliveryAddress: address
          }
        },
        changeOfLiquidatorsDate: '2025-12-30'
      }

      const addButton = page.getByRole('button', { name: 'Add Liquidator' })
      expect(addButton).toBeVisible()
      await addButton.click()
      await fillOutNewRelationship(page, newLiquidator)
      await fillOutAddress(page, address)
      const staffNoFeeRadio = page.getByRole('radio', { name: 'No Fee' })
      expect(staffNoFeeRadio).toBeVisible()
      await staffNoFeeRadio.click()

      const submitBtn = page.getByRole('button', { name: 'Submit' })
      expect(submitBtn).toBeVisible()
      const submitRequest = page.waitForRequest(`**/businesses/${identifier}/filings`, { timeout: 10000 })
      await submitBtn.click()
      const request = await submitRequest
      const requestBody = request.postDataJSON() as FilingSubmissionBody<ChangeOfLiquidators>
      expect(requestBody.filing.changeOfLiquidators).toEqual(innerPayload)
    })

    test('appointLiquidator', async ({ page }) => {
      await navigateToManageLiquidatorsPage(page, LiquidateType.APPOINT)
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
      const newLiquidator = {
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
        roles: [{ roleType: RoleType.LIQUIDATOR }]
      }
      const innerPayload: LiquidatorPayload = {
        relationships: [newLiquidator],
        type: LiquidateType.APPOINT,
        changeOfLiquidatorsDate: '2025-12-30'
      }

      const addButton = page.getByRole('button', { name: 'Add Liquidator' })
      expect(addButton).toBeVisible()
      await addButton.click()
      await fillOutNewRelationship(page, newLiquidator)
      const staffNoFeeRadio = page.getByRole('radio', { name: 'No Fee' })
      expect(staffNoFeeRadio).toBeVisible()
      await staffNoFeeRadio.click()

      const submitBtn = page.getByRole('button', { name: 'Submit' })
      expect(submitBtn).toBeVisible()
      const submitRequest = page.waitForRequest(`**/businesses/${identifier}/filings`, { timeout: 10000 })
      await submitBtn.click()
      const request = await submitRequest
      const requestBody = request.postDataJSON() as FilingSubmissionBody<ChangeOfLiquidators>
      expect(requestBody.filing.changeOfLiquidators).toEqual(innerPayload)
    })

    test('ceaseLiquidator', async ({ page }) => {
      await navigateToManageLiquidatorsPage(page, LiquidateType.CEASE)
      await page.waitForLoadState('networkidle')
      const existingLiquidator = page.getByRole('table').locator('tbody').getByRole('row').first()
      expect(existingLiquidator).toBeVisible()
      const removeBtn = existingLiquidator.getByRole('button', { name: 'Remove' })
      expect(removeBtn).toBeVisible()
      await removeBtn.click()
      const staffNoFeeRadio = page.getByRole('radio', { name: 'No Fee' })
      expect(staffNoFeeRadio).toBeVisible()
      await staffNoFeeRadio.click()

      const submitBtn = page.getByRole('button', { name: 'Submit' })
      expect(submitBtn).toBeVisible()
      const submitRequest = page.waitForRequest(`**/businesses/${identifier}/filings`, { timeout: 10000 })
      await submitBtn.click()
      const request = await submitRequest
      const requestBody = request.postDataJSON() as FilingSubmissionBody<ChangeOfLiquidators>
      expect(requestBody.filing.changeOfLiquidators.type).toBe(LiquidateType.CEASE)
      expect(requestBody.filing.changeOfLiquidators.relationships.length).toBe(1)
      expect(requestBody.filing.changeOfLiquidators.relationships[0]!.actions).toEqual([ActionType.REMOVED])
      expect(requestBody.filing.changeOfLiquidators.relationships[0]!.roles.length).toBe(1)
      expect(requestBody.filing.changeOfLiquidators.relationships[0]!.roles[0]!.cessationDate).toBeDefined()
    })

    test('changeAddressLiquidator', async ({ page }) => {
      await navigateToManageLiquidatorsPage(page, LiquidateType.ADDRESS)
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
      const existingLiquidator = page.getByRole('table').locator('tbody').getByRole('row').first()
      expect(existingLiquidator).toBeVisible()
      const changeBtn = existingLiquidator.getByRole('button', { name: 'Change' })
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
      const requestBody = request.postDataJSON() as FilingSubmissionBody<ChangeOfLiquidators>
      expect(requestBody.filing.changeOfLiquidators.type).toBe(LiquidateType.ADDRESS)
      expect(requestBody.filing.changeOfLiquidators.relationships.length).toBe(1)
      expect(requestBody.filing.changeOfLiquidators.relationships[0]!.actions).toEqual([ActionType.ADDRESS_CHANGED])
      expect(requestBody.filing.changeOfLiquidators.relationships[0]!.deliveryAddress).toEqual(newAddress)
    })
  })
})
