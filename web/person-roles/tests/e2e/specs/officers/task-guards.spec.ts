import { test, expect } from '@playwright/test'
import {
  getRandomRoles,
  setupOfficerChangePage,
  openOfficerForm,
  assertNameTableCell,
  getTableRowForPerson
} from '../../test-utils'
import { fillOutNewRelationship, getFakeAddress, getFakePerson } from '#e2e-utils'
import { partiesBC1234567 } from '~~/tests/mocks'

const initialOfficer = partiesBC1234567.parties[0]!

test.describe('Task Guards', () => {
  test.beforeEach(async ({ page }) => {
    await setupOfficerChangePage(page)
  })

  test('should prevent filing submit when form is open for new officer', async ({ page }) => {
    await openOfficerForm(page)
    await page.getByRole('button', { name: 'Submit' }).click()
    await expect(page.getByTestId('party-details-form')).toContainText('Finish this task before making other changes.')
  })

  test('should prevent filing save and resume when form is open for new officer', async ({ page }) => {
    await openOfficerForm(page)
    await page.getByRole('button', { name: 'Save and Resume Later', exact: true }).click()
    await expect(page.getByTestId('party-details-form')).toContainText('Finish this task before saving.')
  })

  test('should prevent filing submit when form is open when editing existing officer', async ({ page }) => {
    const row = getTableRowForPerson(page, initialOfficer.officer.lastName)
    await openOfficerForm(page, row)
    await page.getByRole('button', { name: 'Submit' }).click()
    await expect(page.getByTestId('party-details-form')).toContainText('Finish this task before submitting.')
  })

  test('should prevent filing save and resume when form is open when editing existing officer', async ({ page }) => {
    const row = getTableRowForPerson(page, initialOfficer.officer.lastName)
    await openOfficerForm(page, row)
    await page.getByRole('button', { name: 'Save and Resume Later', exact: true }).click()
    await expect(page.getByTestId('party-details-form')).toContainText('Finish this task before saving.')
  })

  test('should prevent filing submit when no changes have been made', async ({ page }) => {
    await page.getByRole('button', { name: 'Submit' }).click()
    await expect(page.getByTestId('connect-button-control')).toContainText('There are no changes to submit.')
  })

  test('should prevent filing save and resume when no changes have been made', async ({ page }) => {
    await page.getByRole('button', { name: 'Save and Resume Later', exact: true }).click()
    await expect(page.getByTestId('connect-button-control')).toContainText('There are no changes to save.')
  })

  test('should be able to cancel when no changes have been made', async ({ page }) => {
    await page.getByRole('button', { name: 'Cancel', exact: true }).click()
    // should be redirected to dashboard page
    await expect(page).not.toHaveURL(/.*officer-change.*/)
    expect(page.getByText('Redirected to playwright mocked business dashboard')).toBeVisible()
  })

  test('should NOT be able to cancel when changes have been made', async ({ page }) => {
    const roles = getRandomRoles()
    const newRelationship: BusinessRelationship = {
      entity: getFakePerson(),
      roles: roles.map(role => ({ roleType: role, roleClass: 'OFFICER' } as Role)),
      deliveryAddress: getFakeAddress()
    }

    await openOfficerForm(page)
    await fillOutNewRelationship(page, newRelationship)

    await page.getByRole('button', { name: 'Cancel', exact: true }).click()

    // should have a modal asking to confirm cancelling
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    await expect(modal).toContainText('Unsaved changes')
    await expect(modal)
      .toContainText('You have unsaved changes. Are you sure you want to exit your filing?')
    await expect(page).not.toHaveURL(/.*business-dashboard.*/)
  })

  test('should NOT be able to navigate away when changes have been made', async ({ page }) => {
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

    // https://playwright.dev/docs/dialogs#beforeunload-dialog
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('beforeunload')
      await page.waitForTimeout(5000)
      await dialog.dismiss()
    })

    // Try to cancel with unsaved changes
    await page.getByRole('button', { name: 'Cancel', exact: true }).click()
    // should still be on officer change page due to unsaved changes modal
    await expect(page).toHaveURL(/.*officer-change.*/)
  })

  test('should prevent making changes when form is open for new officer', async ({ page }) => {
    // open add officer form
    await openOfficerForm(page)

    // try to edit the existing officer
    const row = getTableRowForPerson(page, initialOfficer.officer.lastName)
    await openOfficerForm(page, row)

    // form should have error text
    await expect(page.getByTestId('party-details-form')).toContainText('Finish this task before making other changes.')
  })

  test('should prevent making changes when form is open for editing officer', async ({ page }) => {
    // open the form to edit the existing officer
    const row = getTableRowForPerson(page, initialOfficer.officer.lastName)
    await openOfficerForm(page, row)

    // try to open add officer form
    await openOfficerForm(page)

    // form should have error text
    await expect(page.getByTestId('party-details-form')).toContainText('Finish this task before making other changes.')
  })
})
