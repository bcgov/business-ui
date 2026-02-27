import { expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

export async function fillOutName(parentLocator: Page | Locator, entity: Partial<BusinessEntity>) {
  const firstNameInput = parentLocator.getByTestId('first-name-input')
  const lastNameInput = parentLocator.getByTestId('last-name-input')
  const middleNameInput = parentLocator.getByTestId('middle-name-input')
  await expect(firstNameInput).toBeVisible()
  await firstNameInput.fill(entity.givenName!)
  await expect(middleNameInput).toBeVisible()
  if (entity.middleInitial) {
    middleNameInput.fill(entity.middleInitial)
  }
  await expect(lastNameInput).toBeVisible()
  await lastNameInput.fill(entity.familyName!)
  if (entity.alternateName) {
    const preferredNameCheckbox = parentLocator.getByRole(
      'checkbox', { name: 'This person also has another name they prefer to use' })
    await expect(preferredNameCheckbox).toBeVisible()
    await preferredNameCheckbox.check()
    const preferredNameInput = parentLocator.getByTestId('preferred-name-input')
    await expect(preferredNameInput).toBeVisible()
    preferredNameInput.fill(entity.alternateName)
  }
}
