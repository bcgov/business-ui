import { test, expect } from '@playwright/test'
import { ActionType } from '#business/app/enums/action-type'
import { LiquidateType } from '#business/app/enums/liquidate-type'
import { RoleType } from '#business/app/enums/role-type'
import type { ApiAddress } from '#business/app/interfaces/address'
import { fillOutAddress, fillOutNewRelationship, selectDone } from '#business/tests/e2e/test-utils'
import { mockCommonApiCallsForFiling, getPartiesMock, getBusinessAddressesMock } from '#test-mocks'
import { navigateToManageLiquidatorsPage } from '../../test-utils'

const identifier = 'BC1234567'

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
      expect(requestBody.filing.changeOfLiquidators.relationships!.length).toBe(1)
      expect(requestBody.filing.changeOfLiquidators.relationships![0]!.actions).toEqual([ActionType.REMOVED])
      expect(requestBody.filing.changeOfLiquidators.relationships![0]!.roles.length).toBe(1)
      expect(requestBody.filing.changeOfLiquidators.relationships![0]!.roles[0]!.cessationDate).toBeDefined()
    })

    test.describe('changeAddressLiquidator', () => {
      test('change address of a party', async ({ page }) => {
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
        expect(requestBody.filing.changeOfLiquidators.relationships!.length).toBe(1)
        expect(requestBody.filing.changeOfLiquidators.relationships![0]!.actions).toEqual([ActionType.ADDRESS_CHANGED])
        expect(requestBody.filing.changeOfLiquidators.relationships![0]!.deliveryAddress).toEqual(newAddress)
      })

      test('change address of the liquidation records office', async ({ page }) => {
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
        await expect(existingLiquidator).toContainText('TESTER TESTING', { timeout: 10000 })

        await fillOutAddress(page, newAddress)
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
        expect(requestBody.filing.changeOfLiquidators.relationships).toBeUndefined()
        expect(requestBody.filing.changeOfLiquidators.offices?.liquidationRecordsOffice.deliveryAddress)
          .toEqual(newAddress)
        expect(requestBody.filing.changeOfLiquidators.offices?.liquidationRecordsOffice.mailingAddress)
          .toEqual(newAddress)
      })
    })
  })
})
