import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'

export async function fillOutName(page: Page, entity: Partial<BusinessEntity>) {
  const firstNameInput = page.getByTestId('first-name-input')
  const lastNameInput = page.getByTestId('last-name-input')
  await expect(firstNameInput).toBeVisible()
  await firstNameInput.fill(entity.givenName!)
  await expect(lastNameInput).toBeVisible()
  await lastNameInput.fill(entity.familyName!)
}
