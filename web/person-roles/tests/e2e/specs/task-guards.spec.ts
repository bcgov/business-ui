import { test, expect } from '@playwright/test'
import {
  getFakeAddress,
  getFakePerson,
  getRandomRoles,
  setupOfficerChangePage,
  completeOfficerForm,
  openOfficerForm,
  assertNameTableCell,
  getTableRowForPerson,
  getOfficerForm
} from '../test-utils'
import { businessBC1234567, partiesBC1234567 } from '~~/tests/mocks'

const initialOfficer = partiesBC1234567.parties[0]!
const initialOfficerPerson = { lastName: initialOfficer.officer.lastName }

test.describe('Task Guards', () => {
  // test.use({ storageState: 'tests/e2e/.auth/bcsc-user.json' })

  test.beforeEach(async ({ page }) => {
    await setupOfficerChangePage(page)
  })

  test('should prevent filing submit when form is open for new officer', async ({ page }) => {
    await openOfficerForm(page)
    await page.getByRole('button', { name: 'Submit' }).click()
    await expect(getOfficerForm(page)).toContainText('Finish this task before submitting.')
  })

  test('should prevent filing save when form is open for new officer', async ({ page }) => {
    await openOfficerForm(page)
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(getOfficerForm(page)).toContainText('Finish this task before saving.')
  })

  test('should prevent filing save and resume when form is open for new officer', async ({ page }) => {
    await openOfficerForm(page)
    await page.getByRole('button', { name: 'Save and Resume Later', exact: true }).click()
    await expect(getOfficerForm(page)).toContainText('Finish this task before saving.')
  })

  test('should prevent filing submit when form is open when editing existing officer', async ({ page }) => {
    const row = getTableRowForPerson(page, initialOfficerPerson)
    await openOfficerForm(page, row)
    await page.getByRole('button', { name: 'Submit' }).click()
    await expect(getOfficerForm(page)).toContainText('Finish this task before submitting.')
  })

  test('should prevent filing save when form is open when editing existing officer', async ({ page }) => {
    const row = getTableRowForPerson(page, initialOfficerPerson)
    await openOfficerForm(page, row)
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(getOfficerForm(page)).toContainText('Finish this task before saving.')
  })

  test('should prevent filing save and resume when form is open when editing existing officer', async ({ page }) => {
    const row = getTableRowForPerson(page, initialOfficerPerson)
    await openOfficerForm(page, row)
    await page.getByRole('button', { name: 'Save and Resume Later', exact: true }).click()
    await expect(getOfficerForm(page)).toContainText('Finish this task before saving.')
  })

  test('should prevent filing submit when no changes have been made', async ({ page }) => {
    await page.getByRole('button', { name: 'Submit' }).click()
    await expect(page.getByTestId('business-filing-button-control')).toContainText('There are no changes to submit.')
  })

  test('should prevent filing save when no changes have been made', async ({ page }) => {
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(page.getByTestId('business-filing-button-control')).toContainText('There are no changes to save.')
  })

  test('should prevent filing save and resume when no changes have been made', async ({ page }) => {
    await page.getByRole('button', { name: 'Save and Resume Later', exact: true }).click()
    await expect(page.getByTestId('business-filing-button-control')).toContainText('There are no changes to save.')
  })

  test('should be able to cancel when no changes have been made', async ({ page }) => {
    await page.getByRole('button', { name: 'Cancel', exact: true }).click()
    await expect(page).toHaveURL(/.*business-dashboard.*/)
    expect(page.getByText(businessBC1234567.business.legalName).first()).toBeDefined()
  })

  test('should be able to navigate away when no changes have been made', async ({ page }) => {
    await page.getByRole('link', { name: 'Officer Change Test Business' }).click()
    await expect(page).toHaveURL(/.*business-dashboard.*/)
    expect(page.getByText(businessBC1234567.business.legalName).first()).toBeDefined()
  })

  test('should NOT be able to cancel when changes have been made', async ({ page }) => {
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

    // https://playwright.dev/docs/dialogs#beforeunload-dialog
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('beforeunload')
      await page.waitForTimeout(5000)
      await dialog.dismiss()
    })

    await page.getByRole('heading', { name: 'Officer Change' }).click()
    await page.getByRole('link', { name: 'Officer Change Test Business' }).click()
    await expect(page).not.toHaveURL(/.*business-dashboard.*/)
  })

  test('should prevent making changes when form is open for new officer', async ({ page }) => {
    // open add officer form
    await openOfficerForm(page)

    // try to edit the existing officer
    const row = getTableRowForPerson(page, initialOfficerPerson)
    await openOfficerForm(page, row)

    // form should have error text
    await expect(getOfficerForm(page)).toContainText('Finish this task before making other changes.')
  })

  test('should prevent making changes when form is open for editing officer', async ({ page }) => {
    // open the form to edit the existing officer
    const row = getTableRowForPerson(page, initialOfficerPerson)
    await openOfficerForm(page, row)

    // try to open add officer form
    await openOfficerForm(page)

    // form should have error text
    await expect(getOfficerForm(page)).toContainText('Finish this task before making other changes.')
  })
})
