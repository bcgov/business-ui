import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'

import { fillOutAddress } from './fill-out-address'

async function fillOutName(page: Page, entity: Partial<BusinessEntity>) {
  const firstNameInput = page.getByTestId('first-name-input')
  const lastNameInput = page.getByTestId('last-name-input')
  await expect(firstNameInput).toBeVisible()
  await firstNameInput.fill(entity.givenName!)
  await expect(lastNameInput).toBeVisible()
  await lastNameInput.fill(entity.familyName!)
}

async function selectDone(page: Page) {
  const doneBtn = page.getByRole('button', { name: 'Done' })
  await expect(doneBtn).toBeVisible()
  await doneBtn.click()
}

export async function fillOutNewRelationship(page: Page, relationship: BusinessRelationship) {
  await fillOutName(page, relationship.entity)
  await fillOutAddress(page, relationship.deliveryAddress)
  await selectDone(page)
}
