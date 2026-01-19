import { expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

export async function fillOutName(page: Page, entity: Partial<BusinessEntity>, parent?: Locator) {
  const parentLocator = parent ?? page
  const firstNameInput = parentLocator.getByTestId('first-name-input')
  const lastNameInput = parentLocator.getByTestId('last-name-input')
  await expect(firstNameInput).toBeVisible()
  await firstNameInput.fill(entity.givenName!)
  await expect(lastNameInput).toBeVisible()
  await lastNameInput.fill(entity.familyName!)
}
