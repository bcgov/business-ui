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
  getTableRowForPerson
} from '../test-utils'
import { businessBC1234567 } from '~~/tests/mocks'

const identifier = businessBC1234567.business.identifier

test.describe('Adding Officers', () => {
  // test.use({ storageState: 'tests/e2e/.auth/bcsc-user.json' })

  test.beforeEach(async ({ page }) => {
    await setupOfficerChangePage(page)
  })

  test('submit single officer, multiple roles, delivery/mailing address equal', async ({ page }) => {
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

    // submit filing
    await page.getByRole('button', { name: 'Submit' }).click()

    // should be redirected to dashboard page - user will be redirected to bcreg sign in page as test run with mock user
    await expect(page).not.toHaveURL(/.*officer-change.*/)
    // await expect(page).toHaveURL(/.*business-dashboard.*/) // can use this instead once real logins are sorted out
    // expect(page.getByText(businessBC1234567.business.legalName).first()).toBeDefined()
  })

  test('submit multiple officers, multiple roles, different delivery/mailing addresses', async ({ page }) => {
    // get random test data
    const person1 = getFakePerson()
    const roles1 = getRandomRoles()
    const deliveryAddress1 = getFakeAddress()
    const mailingAddress1 = getFakeAddress()
    const person2 = getFakePerson()
    const roles2 = getRandomRoles()
    const deliveryAddress2 = getFakeAddress()
    const mailingAddress2 = getFakeAddress()

    // open form - will be closed by helper util
    await openOfficerForm(page)
    await completeOfficerForm(
      page,
      person1,
      roles1,
      deliveryAddress1,
      mailingAddress1
    )
    // re-open to submit second officer
    await openOfficerForm(page)
    await completeOfficerForm(
      page,
      person2,
      roles2,
      deliveryAddress2,
      mailingAddress2
    )

    // assert table columns for first officer
    await assertNameTableCell(page, person1, ['ADDED'])
    await assertRoles(page, person1, roles1)
    await assertAddress(page, person1, 2, deliveryAddress1)
    await assertAddress(page, person1, 3, mailingAddress1)
    // assert table columns for second officer
    await assertNameTableCell(page, person2, ['ADDED'])
    await assertRoles(page, person2, roles2)
    await assertAddress(page, person2, 2, deliveryAddress2)
    await assertAddress(page, person2, 3, mailingAddress2)

    // submit filing
    await page.getByRole('button', { name: 'Submit' }).click()

    // should be redirected to dashboard page
    // should be redirected to dashboard page - user will be redirected to bcreg sign in page as test run with mock user
    await expect(page).not.toHaveURL(/.*officer-change.*/)
    // await expect(page).toHaveURL(/.*business-dashboard.*/) // can use this instead once real logins are sorted out
    // expect(page.getByText(businessBC1234567.business.legalName).first()).toBeDefined()
  })

  test('should allow canceling the form without adding an officer', async ({ page }) => {
    // get random test data
    const person = getFakePerson()
    const roles = getRandomRoles()
    const deliveryAddress = getFakeAddress()

    // open form - will be closed by helper util
    await openOfficerForm(page)

    // complete form and hit cancel instead of done
    await completeOfficerForm(
      page,
      person,
      roles,
      deliveryAddress,
      undefined,
      true
    )

    // assert officer not added to table
    const table = page.getByRole('table')
    expect(table).toBeDefined()
    const row = table.getByRole('row').filter({ hasText: person.lastName.toUpperCase() })
    expect(row).toHaveCount(0)

    // submit filing
    await page.getByRole('button', { name: 'Submit' }).click()

    // should display error/alert text stating no data to submit
    await expect(page.getByTestId('connect-button-control')).toContainText('There are no changes to submit.')
  })

  test('should be able to remove a newly added officer', async ({ page }) => {
    // complete form
    const person = getFakePerson()
    await openOfficerForm(page)
    await completeOfficerForm(page, person, ['President'], getFakeAddress(), 'same')
    const row = getTableRowForPerson(page, person)
    await expect(row).toBeVisible()

    // open more actions button, select remove
    await row.getByRole('button', { name: 'More Actions' }).click()
    await page.getByRole('menuitem', { name: 'Remove' }).click()

    // row should be deleted
    await expect(row).not.toBeVisible()

    // submit filing
    await page.getByRole('button', { name: 'Submit' }).click()

    // should display error/alert text stating no data to submit
    await expect(page.getByTestId('connect-button-control')).toContainText('There are no changes to submit.')
  })

  test('should display an error modal if the filing POST request fails', async ({ page }) => {
    await openOfficerForm(page)
    await completeOfficerForm(page, getFakePerson(), ['Secretary'], getFakeAddress(), 'same')

    await page.route(`*/**/businesses/${identifier}/filings`, async (route) => {
      await route.fulfill({ status: 500, json: { message: 'Internal Server Error' } })
    })

    await page.getByRole('button', { name: 'Submit' }).click()

    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    await expect(modal).toContainText('An Error Occurred')
    await expect(modal)
      .toContainText("We couldn't complete your request due to an internal error. Please try again later.")
    await expect(page).not.toHaveURL(/.*business-dashboard.*/)
    await expect(page).toHaveURL(/.*officer-change.*/)
  })
})
