import { expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

export function roleDisplayText(role: string) {
  return role === 'Ceo'
    ? 'Chief Executive Officer'
    : role === 'Cfo'
      ? 'Chief Financial Officer'
      : role === 'Other'
        ? 'Other Office(s)'
        : role
}

export async function fillOutRoles(parentLocator: Page | Locator, roles: Role[]) {
  const rolesCheckboxes = parentLocator.getByTestId('party-role-options')
  const isVisible = await rolesCheckboxes.isVisible()

  if (!isVisible) {
    // roles selection is hidden so return
    return
  }
  const allCheckboxes = await rolesCheckboxes.getByRole('checkbox').all()
  for (const checkbox of allCheckboxes) {
    // uncheck all checkboxes
    await checkbox.setChecked(false)
  }
  for (const role of roles) {
    // check given checkboxes
    const roleName = roleDisplayText(role.roleType)

    const checkbox = rolesCheckboxes.getByRole('checkbox', { name: roleName, exact: true })
    await expect(checkbox).toBeVisible()
    const isChecked = await checkbox.isChecked()
    if (!isChecked) {
      await checkbox.check()
    }
  }
}
