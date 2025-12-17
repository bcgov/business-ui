import { test, expect } from '@playwright/test'
import {
  getFakeAddress,
  getFakePerson,
  getRandomRoles,
  setupOfficerChangePage,
  completeOfficerForm,
  openOfficerForm,
  assertNameTableCell,
  assertRoles,
  assertAddress,
  getTableRowForPerson,
  provinceSubdivisions
} from '../test-utils'
import { businessBC1234567, partiesBC1234567 } from '~~/tests/mocks'

const identifier = businessBC1234567.business.identifier
const initialOfficer = partiesBC1234567.parties[0]!
const initialRoles = ['Chief Executive Officer']
const initialDeliveryAddress = {
  street: initialOfficer.deliveryAddress.streetAddress,
  streetAdditional: initialOfficer.deliveryAddress.streetAddressAdditional,
  city: initialOfficer.deliveryAddress.addressCity,
  region: initialOfficer.deliveryAddress.addressRegion,
  postalCode: initialOfficer.deliveryAddress.postalCode,
  country: initialOfficer.deliveryAddress.addressCountry,
  locationDescription: initialOfficer.deliveryAddress.deliveryInstructions
}
const newPerson = getFakePerson()
const newRoles = ['Chair', 'Vice President']
const newDeliveryAddress = getFakeAddress()
const filingId = 'test-id'
const testFolio = 'test-folio'

const draftFilingResponse = {
  filing: {
    header: {
      name: 'changeOfOfficers',
      certifiedBy: 'Test User',
      accountId: 1234,
      date: '2025-09-09',
      type: 'NON_LEGAL',
      folioNumber: testFolio,
      filingId,
      status: 'DRAFT'
    },
    business: businessBC1234567.business,
    changeOfOfficers: [
      {
        old: {
          id: '615058',
          firstName: initialOfficer.officer.firstName,
          middleName: initialOfficer.officer.middleInitial,
          lastName: initialOfficer.officer.lastName,
          preferredName: '',
          roles: [
            {
              roleType: 'CEO',
              roleClass: 'OFFICER',
              appointmentDate: '2025-06-24',
              cessationDate: null
            }
          ],
          deliveryAddress: initialDeliveryAddress,
          mailingAddress: initialDeliveryAddress,
          sameAsDelivery: true,
          hasPreferredName: false
        },
        new: {
          id: '615058',
          firstName: newPerson.firstName,
          middleName: newPerson.middleName,
          lastName: newPerson.middleName,
          preferredName: newPerson.preferredName,
          roles: [
            {
              roleType: 'CHAIR',
              roleClass: 'OFFICER',
              appointmentDate: '2025-09-09',
              cessationDate: null
            },
            {
              roleType: 'VP',
              roleClass: 'OFFICER',
              appointmentDate: '2025-09-09',
              cessationDate: null
            }
          ],
          deliveryAddress: {
            street: newDeliveryAddress.street,
            streetAdditional: newDeliveryAddress.streetAdditional,
            city: newDeliveryAddress.city,
            region: provinceSubdivisions.find(province => province.name === newDeliveryAddress.region)!.code,
            postalCode: newDeliveryAddress.postalCode,
            country: 'CA',
            locationDescription: newDeliveryAddress.locationDescription
          },
          mailingAddress: {
            street: newDeliveryAddress.street,
            streetAdditional: newDeliveryAddress.streetAdditional,
            city: newDeliveryAddress.city,
            region: provinceSubdivisions.find(province => province.name === newDeliveryAddress.region)!.code,
            postalCode: newDeliveryAddress.postalCode,
            country: 'CA',
            locationDescription: newDeliveryAddress.locationDescription
          },
          sameAsDelivery: true,
          hasPreferredName: false
        }
      }
    ]
  }
}

test.describe('Draft Officers', () => {
  // test.use({ storageState: 'tests/e2e/.auth/bcsc-user.json' })
  test.beforeEach(async ({ page }) => {
    await setupOfficerChangePage(page)
  })

  test('should be able to save and reload a draft filing and undo any edits', async ({ page }) => {
    // custom mock the draft filing POST response
    await page.route(`*/**/businesses/${identifier}/filings?draft=true`, async (route) => {
      await route.fulfill({
        status: 201,
        json: draftFilingResponse
      })
    })
    // custom mock the draft filing GET response
    await page.route(`*/**/businesses/${identifier}/filings/${filingId}`, async (route) => {
      await route.fulfill({
        status: 200,
        json: draftFilingResponse
      })
    })

    // edit existing officer
    const row = getTableRowForPerson(page, { lastName: initialOfficer.officer.lastName })
    await openOfficerForm(page, row)
    await completeOfficerForm(
      page,
      newPerson,
      newRoles,
      newDeliveryAddress,
      'same'
    )

    // assert updated table data
    await assertNameTableCell(page, newPerson, ['NAME CHANGED', 'ROLES CHANGED', 'ADDRESS CHANGED'])
    await assertRoles(page, newPerson, newRoles)
    await assertAddress(page, newPerson, 2, newDeliveryAddress)
    await assertAddress(page, newPerson, 3, 'same')

    // save and resume later filing
    await page.getByRole('button', { name: 'Save and Resume Later', exact: true }).click()

    // user should be redirected away
    await expect(page).not.toHaveURL(/.*officer-change.*/)

    // navigate to page - with draft id
    await page.goto(`./en-CA/officer-change/${identifier}?draft=${filingId}`)
    // wait for api response to settle
    await page.waitForResponse('*/**/businesses/**/*')

    // wait for page state to be reinitialized
    await expect(page.getByText('Officer Change').first()).toBeVisible()
    // await page.waitForTimeout(5000)

    // page should reload with saved draft data
    await assertNameTableCell(page, newPerson, ['NAME CHANGED', 'ROLES CHANGED', 'ADDRESS CHANGED'])
    await assertRoles(page, newPerson, newRoles)
    await assertAddress(page, newPerson, 2, newDeliveryAddress)
    await assertAddress(page, newPerson, 3, 'same')

    // should also include folio
    await expect(page.getByTestId('folio-number')).toHaveValue(testFolio)

    // should be able to undo to original state
    const newRow = getTableRowForPerson(page, newPerson)
    await newRow.getByRole('button', { name: 'Undo' }).click()

    // assert all edits have been undone
    await assertNameTableCell(
      page,
      {
        firstName: initialOfficer.officer.firstName,
        middleName: initialOfficer.officer.middleInitial,
        lastName: initialOfficer.officer.lastName
      },
      undefined,
      ['NAME CHANGED', 'ROLES CHANGED', 'ADDRESS CHANGED']
    )
    await assertRoles(page, { lastName: initialOfficer.officer.lastName }, initialRoles)
    await assertAddress(page, { lastName: initialOfficer.officer.lastName }, 2, initialDeliveryAddress)
    await assertAddress(page, { lastName: initialOfficer.officer.lastName }, 3, 'same')
  })

  test('should be redirected to business dashboard when selecting save and resume', async ({ page }) => {
    // mock the draft response
    await page.route(`*/**/businesses/${identifier}/filings?draft=true`, async (route) => {
      await route.fulfill({
        status: 201,
        json: draftFilingResponse
      })
    })
    // get random test data
    const person = getFakePerson()
    const roles = getRandomRoles()
    const deliveryAddress = getFakeAddress()

    // open form - will be closed by helper util
    await openOfficerForm(page)
    await completeOfficerForm(
      page,
      person,
      roles,
      deliveryAddress,
      'same'
    )

    // assert table data
    await assertNameTableCell(page, person, ['ADDED'])
    await assertRoles(page, person, roles)
    await assertAddress(page, person, 2, deliveryAddress)
    await assertAddress(page, person, 3, 'same')

    // save and resume filing
    await page.getByRole('button', { name: 'Save and Resume Later' }).click()

    // should be redirected to dashboard page
    // should be redirected to dashboard page - user will be redirected to bcreg sign in page as test run with mock user
    await expect(page).not.toHaveURL(/.*officer-change.*/)
    // await expect(page).toHaveURL(/.*business-dashboard.*/) // can use this instead once real logins are sorted out
    // expect(page.getByText(businessBC1234567.business.legalName).first()).toBeDefined()
  })
})
