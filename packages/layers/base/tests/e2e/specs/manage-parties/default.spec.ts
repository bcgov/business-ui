import { test, expect } from '@playwright/test'

import { RoleType } from '#business/app/enums/role-type'
import { fillOutName, fillOutRoles, selectDone } from '#business/tests/e2e/test-utils'

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
    expect(columns.length).toBe(5)
    expect(columns[0]!).toHaveText('TESTER  TESTING')
    expect(columns[1]!).toHaveText('Director')
    expect(columns[2]!).toContainText('5-14505 Boul De Pierrefonds,')
    expect(columns[3]!).toHaveText('Same as Delivery Address')
    expect(columns[4]!).toContainText('Change')
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
    const changeBtn = columns[4]!.getByRole('button', { name: 'change' })
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
    await expect(columns[0]!).toContainText(preferredName.toUpperCase())
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
    const changeBtn = columns[4]!.getByRole('button', { name: 'change' })
    await expect(changeBtn).toBeVisible()
    await changeBtn.click()
    // role selection
    await fillOutRoles(page, roles)
    await selectDone(page)

    // should display all roles
    for (const role of roles) {
      await expect(columns[1]!).toContainText(role.roleType)
    }
  })
})
