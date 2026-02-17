import { expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

export async function fillOutRoles(parentLocator: Page | Locator, roles: Role[]) {
  const rolesCheckboxes = parentLocator.getByTestId('party-role-options')
  const isVisible = await rolesCheckboxes.isVisible()

  if (!isVisible) {
    // roles selection is hidden so return
    return
  }
  for (const role of roles) {
    const checkbox = rolesCheckboxes.getByRole('checkbox', { name: role.roleType })
    await expect(checkbox).toBeVisible()
    const isChecked = await checkbox.isChecked()
    if (!isChecked) {
      await checkbox.check()
    }
  }
}
