import { test, expect } from '@playwright/test'
import type { BusinessRelationship } from '#business/app/interfaces/business-relationship'
import type { OrgPerson } from '#business/app/interfaces/org-person'
import { fillOutFolio, fillOutNewRelationship } from '#business/tests/e2e/test-utils'
import { formatPartyUi, formatRelationshipApi } from '#business/app/utils/format-party'
import { getFilingMock } from '#test-mocks'
import {
  setupOfficerChangePage,
  openOfficerForm,
  assertNameTableCell,
  assertRoles,
  assertAddress,
  getTableRowForPerson
} from '../../test-utils'
import { partiesBC1234567 } from '~~/tests/mocks'

const draftFilingResponse = getFilingMock('changeOfOfficers', 'DRAFT')
const identifier = 'BC1234567'
const filingId = draftFilingResponse.filing.header.filingId
const testFolio = draftFilingResponse.filing.header.folioNumber
const newRelationship: BusinessRelationship = JSON.parse(JSON.stringify(
  draftFilingResponse.filing.changeOfOfficers.relationships[0]!))
partiesBC1234567.parties[0]!.officer.id = Number(newRelationship.entity.identifier!)
const initialOfficer = partiesBC1234567.parties[0]!
const initialRelationshipUi = formatPartyUi(initialOfficer as OrgPerson)
const initialRelationship = formatRelationshipApi(initialRelationshipUi)
// FUTURE: playwright not liking the second region dropdown (leaves first one open)
delete newRelationship.mailingAddress

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
    await page.route(
      `*/**/businesses/${identifier}/filings/${filingId}`,
      async (route) => {
        await route.fulfill({
          status: 200,
          json: draftFilingResponse
        })
      })

    // edit existing officer
    const row = getTableRowForPerson(page, initialOfficer.officer.lastName)
    await openOfficerForm(page, row)
    await fillOutNewRelationship(page, newRelationship)
    await fillOutFolio(page, testFolio)

    // assert updated table data
    await assertNameTableCell(page, newRelationship, ['NAME CHANGED', 'ROLES CHANGED', 'ADDRESS CHANGED'])
    const expectedRoles = ['Vice President', 'Chair']
    await assertRoles(page, newRelationship, expectedRoles)
    await assertAddress(page, newRelationship, 2, newRelationship.deliveryAddress)
    await assertAddress(page, newRelationship, 3, 'same')

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
    await assertNameTableCell(page, newRelationship, ['NAME CHANGED', 'ROLES CHANGED', 'ADDRESS CHANGED'])
    await assertRoles(page, newRelationship, expectedRoles)
    await assertAddress(page, newRelationship, 2, newRelationship.deliveryAddress)
    await assertAddress(page, newRelationship, 3, 'same')

    // // should also include folio
    await expect(page.getByTestId('folio-input')).toHaveValue(testFolio)

    // should be able to undo to original state
    const newRow = getTableRowForPerson(page, newRelationship.entity.familyName!)
    await newRow.getByRole('button', { name: 'Undo' }).click()

    // assert all edits have been undone
    await assertNameTableCell(
      page,
      initialRelationship,
      undefined,
      ['NAME CHANGED', 'ROLES CHANGED', 'ADDRESS CHANGED']
    )
    await assertRoles(page, initialRelationship, ['Chief Executive Officer'])
    await assertAddress(page, initialRelationship, 2, initialRelationship.deliveryAddress)
    await assertAddress(page, initialRelationship, 3, 'same')
  })

  test('should submit the expected payload and redirect', async ({ page }) => {
    // custom mock the draft filing POST response
    await page.route(`*/**/businesses/${identifier}/filings?draft=true`, async (route) => {
      await route.fulfill({
        status: 201,
        json: draftFilingResponse
      })
    })
    // edit officer
    const row = getTableRowForPerson(page, initialOfficer.officer.lastName)
    await openOfficerForm(page, row)
    await fillOutNewRelationship(page, newRelationship)
    await fillOutFolio(page, testFolio)

    // save and resume filing
    await page.getByRole('button', { name: 'Save and Resume Later' }).click()

    // should be redirected to dashboard page
    await expect(page).not.toHaveURL(/.*officer-change.*/)
    expect(page.getByText('Redirected to playwright mocked business dashboard')).toBeVisible()
  })
})
