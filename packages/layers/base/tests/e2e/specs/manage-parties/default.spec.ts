import { test, expect } from '@playwright/test'

import { RoleType, RoleTypeUi } from '#business/app/enums/role-type'
import { ROLE_FIELD_CONFIG } from '#business/app/utils/schemas/party/roles'
import { fillOutRoles, fillOutName, fillOutEmail, selectCancel, selectDone } from '#business/tests/e2e/test-utils'

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
    expect(columns[0]!).toHaveText('Tester Testing')
    expect(columns[1]!).toContainText('5-14505 Boul De Pierrefonds,')
    expect(columns[2]!).toHaveText('Same as Mailing Address')
    expect(columns[3]!).toContainText('Director')
    expect(columns[4]!).toContainText('August 16, 2023 to current')
    expect(columns[5]!).toContainText('Correct')
  })

  test('Should be able to add a preferred name', async ({ page }) => {
    await page.goto('./en-CA/examples/components/ManageParties')
    await page.waitForLoadState('networkidle')

    const preferredName = 'PreferredName'

    const manageParties = page.getByTestId('manage-parties')

    const rows = await manageParties.getByRole('table').locator('tbody').getByRole('row').all()
    const columns = await rows[0]!.locator('td').all()
    // verify name
    await expect(columns[0]!).toHaveText('Tester Testing')
    // edit first party
    const correctBtn = columns[5]!.getByRole('button', { name: 'correct' })
    await expect(correctBtn).toBeVisible()
    await correctBtn.click()
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
    await fillOutEmail(page, 'tester.testing@example.com')
    await selectDone(page)

    // should now have preferred name as well
    await expect(columns[0]!).toContainText('Tester Testing')
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
    const correctBtn = columns[5]!.getByRole('button', { name: 'correct' })
    await expect(correctBtn).toBeVisible()
    await correctBtn.click()
    // role selection
    await fillOutRoles(page, roles)
    await fillOutEmail(page, 'tester.testing@example.com')
    await selectDone(page)

    // should display all roles
    for (const role of roles) {
      await expect(columns[3]!).toContainText(role.roleType)
    }
  })

  test('Should show/hide effective date field for Director role per config', async ({ page }) => {
    await page.goto('./en-CA/examples/components/ManageParties')
    await page.waitForLoadState('networkidle')

    const manageParties = page.getByTestId('manage-parties')
    const tbody = manageParties.getByRole('table').locator('tbody')

    // find first row that contains a Director role
    const directorRow = tbody.getByRole('row').filter({ hasText: RoleType.DIRECTOR }).first()
    await directorRow.getByRole('button', { name: 'correct' }).click()

    // effective date input visibility is driven by config, not hardcoded to this role
    const shouldShowEffectiveDate = !!ROLE_FIELD_CONFIG[RoleTypeUi.DIRECTOR]?.effectiveDate
    const effectiveDateInput = page.getByTestId('party-details-form').getByLabel('Effective Date')
    if (shouldShowEffectiveDate) {
      await expect(effectiveDateInput).toBeVisible()
    } else {
      await expect(effectiveDateInput).not.toBeVisible()
    }

    await selectCancel(page)
  })

  test('Should show cessation date field once a Director role is ceased, per config', async ({ page }) => {
    await page.goto('./en-CA/examples/components/ManageParties')
    await page.waitForLoadState('networkidle')

    const manageParties = page.getByTestId('manage-parties')
    const tbody = manageParties.getByRole('table').locator('tbody')

    // find first row that contains a Director role
    const directorRow = tbody.getByRole('row').filter({ hasText: RoleType.DIRECTOR }).first()
    await directorRow.getByRole('button', { name: 'correct' }).click()

    const partyDetailsForm = page.getByTestId('party-details-form')
    // once ceased, the cessation date is shown together with the effective date as a
    // Start Date/End Date range rather than its own separately-labelled section
    const cessationDateInput = partyDetailsForm.getByLabel('End Date')

    // not ceased yet, so the field is hidden regardless of config
    await expect(cessationDateInput).not.toBeVisible()

    // uncheck the Director role to cease it
    const directorCheckbox = partyDetailsForm
      .getByTestId('party-role-options')
      .getByRole('checkbox', { name: RoleType.DIRECTOR, exact: true })
    await directorCheckbox.setChecked(false)

    const shouldShowCessationDate = !!ROLE_FIELD_CONFIG[RoleTypeUi.DIRECTOR]?.cessationDate
    if (shouldShowCessationDate) {
      await expect(cessationDateInput).toBeVisible()
    } else {
      await expect(cessationDateInput).not.toBeVisible()
    }

    await selectCancel(page)
  })
})
