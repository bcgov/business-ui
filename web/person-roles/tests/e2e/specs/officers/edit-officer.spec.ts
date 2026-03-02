import { test, expect } from '@playwright/test'
import {
  getRandomRoles,
  setupOfficerChangePage,
  openOfficerForm,
  assertNameTableCell,
  assertRoles,
  assertAddress,
  getTableRowForPerson
} from '../../test-utils'
import { formatPartyUi, formatRelationshipApi } from '#business/app/utils/format-party'
import {
  getFakeAddress,
  getFakePerson,
  fillOutAddress,
  fillOutNewRelationship,
  fillOutRoles,
  roleDisplayText
} from '#e2e-utils'
import { businessBC1234567, partiesBC1234567 } from '~~/tests/mocks'

const identifier = businessBC1234567.business.identifier

test.describe('Editing Officers', () => {
  const initialOfficer = partiesBC1234567.parties[0]!
  const initialRelationshipUi = formatPartyUi(initialOfficer as OrgPerson)
  const initialRelationship = formatRelationshipApi(initialRelationshipUi)

  test.beforeEach(async ({ page }) => {
    await setupOfficerChangePage(page)
  })

  test('should edit multiple fields of an existing officer', async ({ page }) => {
    const roles = getRandomRoles()
    const updatedRelationship: BusinessRelationship = {
      entity: getFakePerson(),
      roles: roles.map(role => ({ roleType: role, roleClass: 'OFFICER' } as Role)),
      deliveryAddress: getFakeAddress()
    }

    const row = getTableRowForPerson(page, initialRelationship.entity.familyName!)
    await expect(row).toBeVisible()

    await openOfficerForm(page, row)
    await fillOutNewRelationship(page, updatedRelationship)

    const updatedRow = getTableRowForPerson(page, updatedRelationship.entity.familyName!)
    await expect(updatedRow).toBeVisible()
    await assertNameTableCell(page, updatedRelationship, ['ADDRESS CHANGED', 'NAME CHANGED', 'ROLES CHANGED'])

    // delivery should be updated
    await assertAddress(page, updatedRelationship, 2, updatedRelationship.deliveryAddress)
    // mailing should be empty
    await assertAddress(page, updatedRelationship, 3, 'same')

    // should be redirected to business dashboard on submit
    await page.getByRole('button', { name: 'Submit' }).click()

    // should be redirected to dashboard page
    await expect(page).not.toHaveURL(/.*officer-change.*/)
    expect(page.getByText('Redirected to playwright mocked business dashboard')).toBeVisible()
  })

  test('should cancel an edit without saving changes', async ({ page }) => {
    const roles = getRandomRoles()
    const updatedRelationship: BusinessRelationship = {
      entity: getFakePerson(),
      roles: roles.map(role => ({ roleType: role, roleClass: 'OFFICER' } as Role)),
      deliveryAddress: getFakeAddress()
    }

    const row = getTableRowForPerson(page, initialRelationship.entity.familyName!)
    await expect(row).toBeVisible()

    await openOfficerForm(page, row)
    // cancel instead of done
    await fillOutNewRelationship(page, updatedRelationship, true)

    await expect(row.getByRole('cell').first()).toContainText(initialRelationship.entity.givenName!.toUpperCase())
    await expect(row.getByRole('cell').first()).not.toContainText(updatedRelationship.entity.givenName!)
    await expect(row.getByRole('cell').first()).not.toContainText('NAME CHANGED')
  })

  test('should be able to remove an existing officer', async ({ page }) => {
    const row = getTableRowForPerson(page, initialOfficer.officer.lastName)

    // edit name only
    await row.getByRole('button', { name: 'Change' }).click()
    const form = page.getByTestId('party-details-form')
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
    // should be redirected to dashboard page
    await expect(page).not.toHaveURL(/.*officer-change.*/)
    expect(page.getByText('Redirected to playwright mocked business dashboard')).toBeVisible()
  })

  test('should be able to undo edits to original state', async ({ page }) => {
    const row = getTableRowForPerson(page, initialOfficer.officer.lastName)

    // edit/assert address once
    const newAddress1 = getFakeAddress()
    await openOfficerForm(page, row)
    await fillOutAddress(page, newAddress1, 'delivery', true)
    await page.getByRole('button', { name: 'Done' }).click()
    await assertAddress(page, initialRelationship, 2, newAddress1)
    await assertAddress(page, initialRelationship, 3, 'same')
    await assertNameTableCell(page, initialRelationship, ['ADDRESS CHANGED'])
    // edit/assert address a second time
    const newAddress2 = getFakeAddress()
    await openOfficerForm(page, row)
    await fillOutAddress(page, newAddress2, 'delivery', true)
    await page.getByRole('button', { name: 'Done' }).click()
    await assertAddress(page, initialRelationship, 2, newAddress2)
    await assertAddress(page, initialRelationship, 3, 'same')
    await assertNameTableCell(page, initialRelationship, ['ADDRESS CHANGED'])

    // undo changes
    await row.getByRole('button', { name: 'Undo' }).click()

    // address should have initial state
    await expect(row.getByRole('cell').nth(2)).not.toContainText(newAddress1.streetAddress)
    await expect(row.getByRole('cell').nth(2)).not.toContainText(newAddress2.streetAddress)
    await expect(row.getByRole('cell').nth(2)).toContainText(initialOfficer.deliveryAddress.streetAddress)
    // name column shouldnt have ADDRESS CHANGED badge anymore
    await expect(row.getByRole('cell').nth(0)).not.toContainText('ADDRESS CHANGED')
  })

  test('should only have "ADDED" badge when editing a new officer', async ({ page }) => {
    // start with no existing parties
    await page.route(`*/**/businesses/${identifier}/parties?classType=officer`, async (route) => {
      await route.fulfill({ json: { parties: [] } })
    })

    const roles = getRandomRoles()
    const newRelationship: BusinessRelationship = {
      entity: getFakePerson(),
      roles: roles.map(role => ({ roleType: role, roleClass: 'OFFICER' } as Role)),
      deliveryAddress: getFakeAddress()
    }

    // add new officer
    await openOfficerForm(page)
    await fillOutNewRelationship(page, newRelationship)

    const row = getTableRowForPerson(page, newRelationship.entity.familyName!)

    // assert table state
    await assertNameTableCell(page, newRelationship, ['ADDED'])
    const expectedRoles = roles.map(role => roleDisplayText(role))
    await assertRoles(page, newRelationship, expectedRoles)
    await assertAddress(page, newRelationship, 2, newRelationship.deliveryAddress)
    await assertAddress(page, newRelationship, 3, 'same')

    // edit/assert address
    const newAddress = getFakeAddress()
    await openOfficerForm(page, row)
    await fillOutAddress(page, newAddress, 'delivery', true)
    await page.getByRole('button', { name: 'Done' }).click()
    // should have new adddress
    await assertAddress(page, newRelationship, 2, newAddress)
    // should still only have ADDED badge
    await expect(row.getByRole('cell').nth(0)).toContainText('ADDED')
    await expect(row.getByRole('cell').nth(0)).not.toContainText('ADDRESS CHANGED')

    // edit/assert name
    const newPerson = getFakePerson()
    await openOfficerForm(page, row)
    // edit first name only
    await page.getByTestId('first-name-input').fill(newPerson.givenName)
    await page.getByRole('button', { name: 'Done' }).click()
    const updatedRelationship = JSON.parse(JSON.stringify(newRelationship))
    updatedRelationship.entity.givenName = newPerson.givenName
    await assertNameTableCell(page, updatedRelationship, ['ADDED'])
    // should only have ADDED badge
    await expect(row.getByRole('cell').nth(0)).not.toContainText('NAME CHANGED')

    // edit/assert roles
    const newRoles = getRandomRoles()
    await openOfficerForm(page, row)
    await fillOutRoles(page, newRoles.map(role => ({ roleType: role, roleClass: 'OFFICER' } as Role)))
    await page.getByRole('button', { name: 'Done' }).click()
    await expect(row.getByRole('cell').nth(0)).toContainText('ADDED')
    // should only have ADDED badge
    await expect(row.getByRole('cell').nth(0)).not.toContainText('ROLES CHANGED')
  })
})
