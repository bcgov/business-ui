import { test, expect } from '@playwright/test'
import {
  getFakeAddress,
  getFakePerson,
  getRandomRoles,
  setupOfficerChangePage,
  completeOfficerForm,
  fillAddress,
  selectRoles,
  openOfficerForm,
  assertNameTableCell,
  assertRoles,
  assertAddress,
  getTableRowForPerson
} from '../test-utils'
import { partiesBC1234567 } from '~~/tests/mocks'

test.describe('Editing Officers', () => {
  // test.use({ storageState: 'tests/e2e/.auth/bcsc-user.json' })

  const identifier = 'BC1234567'
  const initialOfficer = partiesBC1234567.parties[0]!

  test.beforeEach(async ({ page }) => {
    await setupOfficerChangePage(page)
  })

  test('should edit multiple fields of an existing officer', async ({ page }) => {
    const updatedPerson = getFakePerson()
    const updatedRoles = getRandomRoles()
    const updatedAddress = getFakeAddress()

    const row = getTableRowForPerson(page, { lastName: initialOfficer.officer.lastName })
    await expect(row).toBeVisible()

    await openOfficerForm(page, row)
    await completeOfficerForm(
      page,
      updatedPerson,
      updatedRoles,
      updatedAddress
    )

    const updatedRow = getTableRowForPerson(page, { lastName: updatedPerson.lastName })
    await expect(updatedRow).toBeVisible()
    await assertNameTableCell(page, updatedPerson, ['ADDRESS CHANGED', 'NAME CHANGED', 'ROLES CHANGED'])

    // delivery should be updated
    await assertAddress(page, updatedPerson, 2, updatedAddress)
    // mailing should be empty
    await assertAddress(page, updatedPerson, 3, undefined)

    // should be redirected to business dashboard on submit
    await page.getByRole('button', { name: 'Submit' }).click()
    // should be redirected to dashboard page - user will be redirected to bcreg sign in page as test run with mock user
    await expect(page).not.toHaveURL(/.*officer-change.*/)
    // await expect(page).toHaveURL(/.*business-dashboard.*/) // can use this instead once real logins are sorted out
  })

  test('should cancel an edit without saving changes', async ({ page }) => {
    const updatedPerson = getFakePerson()
    const updatedRoles = getRandomRoles()
    const updatedAddress = getFakeAddress()
    const originalName = initialOfficer.officer.firstName
    const row = getTableRowForPerson(page, { lastName: originalName })
    const editedName = 'Edited Name'

    await expect(row).toBeVisible()

    await openOfficerForm(page, row)
    await completeOfficerForm(
      page,
      updatedPerson,
      updatedRoles,
      updatedAddress,
      undefined,
      true // click cancel instead of done
    )

    await expect(row.getByRole('cell').first()).toContainText(originalName.toUpperCase())
    await expect(row.getByRole('cell').first()).not.toContainText(editedName)
    await expect(row.getByRole('cell').first()).not.toContainText('NAME CHANGED')
  })

  test('should be able to remove an existing officer', async ({ page }) => {
    const row = getTableRowForPerson(page, { lastName: initialOfficer.officer.lastName })

    // edit name only
    await row.getByRole('button', { name: 'Change' }).click()
    const form = page.getByTestId('officer-form')
    await page.getByTestId('first-name-input').fill('Edited Name')
    await form.getByRole('button', { name: 'Done' }).click()

    // should have name changed badge
    await expect(row.getByRole('cell').first()).toContainText('NAME CHANGED')

    // remove row
    await row.getByRole('button', { name: 'More Actions' }).click()
    await page.getByRole('menuitem', { name: 'Remove' }).click()

    // removing an existing officer shouldnt remove it from the table but add a REMOVED badge instead
    await expect(row).toContainText('REMOVED')
    // removed badge overwrites all other badges
    await expect(row).not.toContainText('NAME CHANGED')

    // should be able to submit a removed officer
    await page.getByRole('button', { name: 'Submit' }).click()
    // should be redirected to dashboard page - user will be redirected to bcreg sign in page as test run with mock user
    await expect(page).not.toHaveURL(/.*officer-change.*/)
    // await expect(page).toHaveURL(/.*business-dashboard.*/) // can use this instead once real logins are sorted out
  })

  test('should be able to undo edits to original state', async ({ page }) => {
    const person = { lastName: initialOfficer.officer.lastName }
    const row = getTableRowForPerson(page, person)

    // edit/assert address once
    const newAddress1 = getFakeAddress()
    await openOfficerForm(page, row)
    await fillAddress(page, 'delivery', newAddress1)
    await page.getByRole('button', { name: 'Done' }).click()
    await assertAddress(page, person, 2, newAddress1)
    await assertNameTableCell(page, person, ['ADDRESS CHANGED'])
    // edit/assert address a second time
    const newAddress2 = getFakeAddress()
    await openOfficerForm(page, row)
    await fillAddress(page, 'delivery', newAddress2)
    await page.getByRole('button', { name: 'Done' }).click()
    await assertAddress(page, person, 2, newAddress2)
    await assertNameTableCell(page, person, ['ADDRESS CHANGED'])

    // undo changes
    await row.getByRole('button', { name: 'Undo' }).click()

    // address should have initial state
    await expect(row.getByRole('cell').nth(2)).not.toContainText(newAddress1.street)
    await expect(row.getByRole('cell').nth(2)).not.toContainText(newAddress2.street)
    await expect(row.getByRole('cell').nth(2)).toContainText(initialOfficer.deliveryAddress.streetAddress)
    // name column shouldnt have ADDRESS CHANGED badge anymore
    await expect(row.getByRole('cell').nth(0)).not.toContainText('ADDRESS CHANGED')
  })

  test('should only have "ADDED" badge when editing a new officer', async ({ page }) => {
    // start with no existing parties
    await page.route(`*/**/businesses/${identifier}/parties?classType=officer`, async (route) => {
      await route.fulfill({ json: { parties: [] } })
    })

    const person = getFakePerson()
    const roles = getRandomRoles()
    const deliveryAddress = getFakeAddress()

    // add new officer
    await openOfficerForm(page)
    await completeOfficerForm(page, person, roles, deliveryAddress)

    const row = getTableRowForPerson(page, person)

    // assert table state
    await assertNameTableCell(page, person, ['ADDED'])
    await assertRoles(page, person, roles)
    await assertAddress(page, person, 2, deliveryAddress)

    // edit/assert address
    const newAddress = getFakeAddress()
    await openOfficerForm(page, row)
    await fillAddress(page, 'delivery', newAddress)
    await page.getByRole('button', { name: 'Done' }).click()
    // should have new adddress
    await assertAddress(page, person, 2, newAddress)
    // should still only have ADDED badge
    await expect(row.getByRole('cell').nth(0)).toContainText('ADDED')
    await expect(row.getByRole('cell').nth(0)).not.toContainText('ADDRESS CHANGED')

    // edit/assert name
    const newPerson = getFakePerson()
    await openOfficerForm(page, row)
    // edit first name only
    await page.getByTestId('first-name-input').fill(newPerson.firstName)
    await page.getByRole('button', { name: 'Done' }).click()
    await assertNameTableCell(page, { ...person, firstName: newPerson.firstName }, ['ADDED'])
    // should only have ADDED badge
    await expect(row.getByRole('cell').nth(0)).not.toContainText('NAME CHANGED')

    // edit/assert roles
    const newRoles = getRandomRoles()
    await openOfficerForm(page, row)
    await selectRoles(page, newRoles)
    await page.getByRole('button', { name: 'Done' }).click()
    await expect(row.getByRole('cell').nth(0)).toContainText('ADDED')
    // should only have ADDED badge
    await expect(row.getByRole('cell').nth(0)).not.toContainText('ROLES CHANGED')
  })
})
