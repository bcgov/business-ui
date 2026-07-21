import { test, expect } from '@playwright/test'

import { RoleType } from '#business/app/enums/role-type'
import { fillOutRoles, fillOutName, selectCancel, selectDone } from '#business/tests/e2e/test-utils'

// FUTURE: flush this out
test.describe('ManageParties', () => {
  test('Should render table with expected data', async ({ page }) => {
    await page.goto('./en-CA/examples/components/ManageParties')
    await page.waitForLoadState('networkidle')

    const manageParties = page.getByTestId('manage-parties')
    await expect(manageParties).toBeVisible()

    // has expected rows
    const rows = await manageParties.getByRole('table').locator('tbody').getByRole('row').all()
    expect(rows.length).toBe(3)
    // has expected columns
    const columns = await rows[0]!.locator('td').all()
    expect(columns.length).toBe(6)
    expect(columns[0]!).toHaveText('TESTER  TESTING')
    expect(columns[1]!).toContainText('5-14505 Boul De Pierrefonds,')
    expect(columns[2]!).toHaveText('Same as Mailing Address')
    expect(columns[3]!).toContainText('Director')
    expect(columns[4]!).toContainText('August 16, 2023 to current')
    expect(columns[5]!).toContainText('Change')
  })

  test('Should be able to add a preferred name', async ({ page }) => {
    await page.goto('./en-CA/examples/components/ManageParties')
    await page.waitForLoadState('networkidle')

    const preferredName = 'PreferredName'

    const manageParties = page.getByTestId('manage-parties')

    const rows = await manageParties.getByRole('table').locator('tbody').getByRole('row').all()
    const columns = await rows[0]!.locator('td').all()
    // verify name
    await expect(columns[0]!).toHaveText('TESTER  TESTING')
    // edit first party
    const changeBtn = columns[5]!.getByRole('button', { name: 'change' })
    await expect(changeBtn).toBeVisible()
    await changeBtn.click()
    // edit name
    const entity: BusinessEntity = {
      alternateName: preferredName,
      familyName: 'Testing',
      givenName: 'Tester',
      middleInitial: '',
      businessName: '',
      businessIdentifier: '',
      email: '',
      identifier: ''
    }
    await fillOutName(page, entity)
    await selectDone(page)

    // should now have preferred name as well
    await expect(columns[0]!).toContainText('TESTER  TESTING')
    await expect(columns[0]!).toContainText('Preferred Name:')
    await expect(columns[0]!).toContainText(preferredName)
  })

  test('Should be able to select roles', async ({ page }) => {
    await page.goto('./en-CA/examples/components/ManageParties')
    await page.waitForLoadState('networkidle')

    const manageParties = page.getByTestId('manage-parties')
    const roles: Role[] = [
      {
        roleType: RoleType.DIRECTOR
      },
      {
        roleType: RoleType.RECEIVER
      },
      {
        roleType: RoleType.LIQUIDATOR
      }
    ]

    const rows = await manageParties.getByRole('table').locator('tbody').getByRole('row').all()
    const columns = await rows[0]!.locator('td').all()
    // edit first party
    const changeBtn = columns[5]!.getByRole('button', { name: 'change' })
    await expect(changeBtn).toBeVisible()
    await changeBtn.click()
    // role selection
    await fillOutRoles(page, roles)
    await selectDone(page)

    // should display all roles
    for (const role of roles) {
      await expect(columns[3]!).toContainText(role.roleType)
    }
  })

  test('Should show effective date field when party has Director role', async ({ page }) => {
    await page.goto('./en-CA/examples/components/ManageParties')
    await page.waitForLoadState('networkidle')

    const manageParties = page.getByTestId('manage-parties')
    const tbody = manageParties.getByRole('table').locator('tbody')

    // find first row that contains a Director role
    const directorRow = tbody.getByRole('row').filter({ hasText: RoleType.DIRECTOR }).first()
    await directorRow.getByRole('button', { name: 'change' }).click()

    // effective date input should be visible
    const effectiveDateInput = page.getByTestId('party-details-form').getByLabel('Effective Date')
    await expect(effectiveDateInput).toBeVisible()

    await selectCancel(page)
  })

  test('Should not show effective date field when party has no Director role', async ({ page }) => {
    await page.goto('./en-CA/examples/components/ManageParties')
    await page.waitForLoadState('networkidle')

    const manageParties = page.getByTestId('manage-parties')
    const tbody = manageParties.getByRole('table').locator('tbody')

    // find first row that does not contain a Director role
    const nonDirectorRow = tbody.getByRole('row').filter({ hasNotText: RoleType.DIRECTOR }).first()
    await nonDirectorRow.getByRole('button', { name: 'change' }).click()

    // effective date input should not be visible
    const effectiveDateInput = page.getByTestId('party-details-form').getByLabel('Effective Date')
    await expect(effectiveDateInput).not.toBeVisible()

    await selectCancel(page)
  })
})
