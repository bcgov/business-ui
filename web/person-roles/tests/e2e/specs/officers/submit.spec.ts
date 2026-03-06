import { test, expect } from '@playwright/test'
import { ActionType } from '#business/app/enums/action-type'
import { RoleType } from '#business/app/enums/role-type'
import { RoleClass } from '#business/app/enums/role-class'
import { fillOutFolio, fillOutNewRelationship } from '#business/tests/e2e/test-utils'
import { mockCommonApiCallsForFiling, getPartiesMock, getBusinessAddressesMock } from '#test-mocks'
import { navigateToOfficerChangePage } from '../../test-utils'

const identifier = 'BC1234567'

test.describe('Manage Officers - Submission', () => {
  test.beforeEach(async ({ page }) => {
    await mockCommonApiCallsForFiling(
      page,
      identifier,
      getPartiesMock([]),
      undefined,
      getBusinessAddressesMock()
    )
  })

  test('Success - add officer', async ({ page }) => {
    await navigateToOfficerChangePage(page)
    await page.waitForLoadState('networkidle')
    const address = {
      streetAddress: 'street',
      streetAddressAdditional: '',
      addressCity: 'city',
      addressCountry: 'CA',
      addressRegion: 'AB',
      deliveryInstructions: '',
      postalCode: 'V1N 4H8'
    }
    const newOfficer = {
      actions: [ActionType.ADDED],
      entity: {
        alternateName: '',
        businessName: '',
        familyName: 'last name',
        givenName: 'first name',
        identifier: '',
        middleInitial: ''
      },
      deliveryAddress: address,
      mailingAddress: address,
      roles: [{ roleType: RoleType.CEO, roleClass: RoleClass.OFFICER }]
    }
    const innerPayload: OfficersPayload = {
      relationships: [newOfficer]
    }
    const testFolio = '1234'

    const addButton = page.getByRole('button', { name: 'Add Officer' })
    expect(addButton).toBeVisible()
    await addButton.click()
    await fillOutNewRelationship(page, newOfficer)
    await fillOutFolio(page, testFolio)

    const submitBtn = page.getByRole('button', { name: 'Submit' })
    expect(submitBtn).toBeVisible()
    const submitRequest = page.waitForRequest(`**/businesses/${identifier}/filings`, { timeout: 10000 })
    await submitBtn.click()
    const request = await submitRequest
    const requestBody = request.postDataJSON() as FilingSubmissionBody<ChangeOfOfficers>
    // @ts-expect-error - temporary until schema is updated
    innerPayload.relationships[0]!.roles[0]!.roleType = 'CEO'
    expect(requestBody.filing.changeOfOfficers).toEqual(innerPayload)
    expect(requestBody.filing.header.folioNumber).toBe(testFolio)
  })
  test('Fail - add officer', async ({ page }) => {
    await navigateToOfficerChangePage(page)
    await page.waitForLoadState('networkidle')
    const address = {
      streetAddress: 'street',
      streetAddressAdditional: '',
      addressCity: 'city',
      addressCountry: 'CA',
      addressRegion: 'AB',
      deliveryInstructions: '',
      postalCode: 'V1N 4H8'
    }
    const newOfficer = {
      actions: [ActionType.ADDED],
      entity: {
        alternateName: '',
        businessName: '',
        familyName: 'last name',
        givenName: 'first name',
        identifier: '',
        middleInitial: ''
      },
      deliveryAddress: address,
      mailingAddress: address,
      roles: [{ roleType: RoleType.CEO, roleClass: RoleClass.OFFICER }]
    }
    const innerPayload: OfficersPayload = {
      relationships: [newOfficer]
    }
    const testFolio = '1234'

    const addButton = page.getByRole('button', { name: 'Add Officer' })
    expect(addButton).toBeVisible()
    await addButton.click()
    await fillOutNewRelationship(page, newOfficer)
    await fillOutFolio(page, testFolio)

    const submitBtn = page.getByRole('button', { name: 'Submit' })
    expect(submitBtn).toBeVisible()
    const filingId = 12345
    page.route(`*/**/businesses/${identifier}/filings`, async (route) => {
      await route.fulfill({
        status: 402,
        json: {
          errors: ['blabalba'],
          filing: { header: { filingId } }
        }
      })
    })
    await submitBtn.click()
    await expect(page).toHaveURL((url) => {
      const params = url.searchParams
      return params.has('draft') && params.get('draft') === filingId.toString()
    })
  })
})
