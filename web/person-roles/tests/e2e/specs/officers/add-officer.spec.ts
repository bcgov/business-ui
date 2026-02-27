import { test, expect } from '@playwright/test'
import type { BusinessRelationship } from '#business/app/interfaces/business-relationship'
import type { Role } from '#business/app/interfaces/role'
import { fillOutNewRelationship } from '#business/tests/e2e/test-utils'
import {
  setupOfficerChangePage,
  openOfficerForm,
  assertNameTableCell,
  assertRoles,
  assertAddress,
  getRandomRoles,
  getTableRowForPerson
} from '../../test-utils'
import { getFakeAddress, getFakePerson, roleDisplayText } from '#e2e-utils'

const identifier = 'BC1234567'

test.describe('Adding Officers', () => {
  test.beforeEach(async ({ page }) => {
    await setupOfficerChangePage(page)
  })

  test('submit single officer, multiple roles, delivery/mailing address equal', async ({ page }) => {
    // get random test data
    const roles = getRandomRoles()
    const newRelationship: BusinessRelationship = {
      entity: getFakePerson(),
      roles: roles.map(role => ({ roleType: role, roleClass: 'OFFICER' } as Role)),
      deliveryAddress: getFakeAddress()
    }

    await openOfficerForm(page)
    await fillOutNewRelationship(page, newRelationship)

    // assert table data
    await assertNameTableCell(page, newRelationship, ['ADDED'])
    const expectedRoles = roles.map(role => roleDisplayText(role))
    await assertRoles(page, newRelationship, expectedRoles)
    await assertAddress(page, newRelationship, 2, newRelationship.deliveryAddress)
    await assertAddress(page, newRelationship, 3, 'same')

    // submit filing
    await page.getByRole('button', { name: 'Submit' }).click()

    // should be redirected to dashboard page
    await expect(page).not.toHaveURL(/.*officer-change.*/)
    expect(page.getByText('Redirected to playwright mocked business dashboard')).toBeVisible()
  })

  test('submit multiple officers, multiple roles, different delivery/mailing addresses', async ({ page }) => {
    // get random test data
    const roles1 = getRandomRoles()
    const newRelationship1: BusinessRelationship = {
      entity: getFakePerson(),
      roles: roles1.map(role => ({ roleType: role, roleClass: 'OFFICER' } as Role)),
      deliveryAddress: getFakeAddress(),
      mailingAddress: getFakeAddress()
    }
    const roles2 = getRandomRoles()
    const newRelationship2: BusinessRelationship = {
      entity: getFakePerson(),
      roles: roles2.map(role => ({ roleType: role, roleClass: 'OFFICER' } as Role)),
      deliveryAddress: getFakeAddress(),
      mailingAddress: getFakeAddress()
    }

    // open form - will be closed by helper util
    await openOfficerForm(page)
    await fillOutNewRelationship(page, newRelationship1)
    // re-open to submit second officer
    await openOfficerForm(page)
    await fillOutNewRelationship(page, newRelationship2)

    // assert table columns for first officer
    await assertNameTableCell(page, newRelationship1, ['ADDED'])
    const expectedRoles1 = roles1.map(role => roleDisplayText(role))
    await assertRoles(page, newRelationship1, expectedRoles1)
    await assertAddress(page, newRelationship1, 2, newRelationship1.deliveryAddress)
    await assertAddress(page, newRelationship1, 3, newRelationship1.mailingAddress!)
    // assert table columns for second officer
    await assertNameTableCell(page, newRelationship1, ['ADDED'])
    const expectedRoles2 = roles2.map(role => roleDisplayText(role))
    await assertRoles(page, newRelationship2, expectedRoles2)
    await assertAddress(page, newRelationship2, 2, newRelationship2.deliveryAddress)
    await assertAddress(page, newRelationship2, 3, newRelationship2.mailingAddress!)

    // submit filing
    await page.getByRole('button', { name: 'Submit' }).click()

    // should be redirected to dashboard page
    await expect(page).not.toHaveURL(/.*officer-change.*/)
    expect(page.getByText('Redirected to playwright mocked business dashboard')).toBeVisible()
  })

  test('should allow canceling the form without adding an officer', async ({ page }) => {
    // get random test data
    const roles = getRandomRoles()
    const newRelationship: BusinessRelationship = {
      entity: getFakePerson(),
      roles: roles.map(role => ({ roleType: role, roleClass: 'OFFICER' } as Role)),
      deliveryAddress: getFakeAddress()
    }

    // open form - will be closed by helper util
    await openOfficerForm(page)

    // complete form and hit cancel instead of done
    await fillOutNewRelationship(page, newRelationship, true)

    // assert officer not added to table
    const table = page.getByRole('table')
    expect(table).toBeDefined()
    const row = table.getByRole('row').filter({ hasText: newRelationship.entity.familyName!.toUpperCase() })
    expect(row).toHaveCount(0)

    // submit filing
    await page.getByRole('button', { name: 'Submit' }).click()

    // should display error/alert text stating no data to submit
    await expect(page.getByTestId('connect-button-control')).toContainText('There are no changes to submit.')
  })

  test('should be able to remove a newly added officer', async ({ page }) => {
    // get random test data
    const roles = getRandomRoles()
    const newRelationship: BusinessRelationship = {
      entity: getFakePerson(),
      roles: roles.map(role => ({ roleType: role, roleClass: 'OFFICER' } as Role)),
      deliveryAddress: getFakeAddress()
    }
    // open form - will be closed by helper util
    await openOfficerForm(page)

    // complete form
    await fillOutNewRelationship(page, newRelationship)

    const row = getTableRowForPerson(page, newRelationship.entity.familyName!)
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
    // get random test data
    const roles = getRandomRoles()
    const newRelationship: BusinessRelationship = {
      entity: getFakePerson(),
      roles: roles.map(role => ({ roleType: role, roleClass: 'OFFICER' } as Role)),
      deliveryAddress: getFakeAddress()
    }
    // open form - will be closed by helper util
    await openOfficerForm(page)

    // complete form
    await fillOutNewRelationship(page, newRelationship)

    await page.route(`*/**/businesses/${identifier}/filings`, async (route) => {
      await route.fulfill({ status: 500, json: { message: 'Internal Server Error' } })
    })

    await page.getByRole('button', { name: 'Submit' }).click()

    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    await expect(modal).toContainText('An Error Occurred')
    await expect(modal)
      .toContainText("We couldn't complete your request due to an internal error. Please try again later.")
    await expect(page).toHaveURL(/.*officer-change.*/)
    expect(page.getByText('Redirected to playwright mocked business dashboard')).not.toBeVisible()
  })
})
