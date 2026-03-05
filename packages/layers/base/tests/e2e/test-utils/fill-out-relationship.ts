import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

import { fillOutAddress } from './fill-out-address'
import { fillOutName } from './fill-out-name'
import { fillOutRoles } from './fill-out-roles'
import { selectDone } from './select-done'
import { selectCancel } from './select-cancel'

export async function fillOutNewRelationship(page: Page, relationship: BusinessRelationship, cancel = false) {
  const parentLocator = page.getByTestId('party-details-form')
  await fillOutName(parentLocator, relationship.entity)
  await fillOutRoles(parentLocator, relationship.roles)
  if (relationship.mailingAddress) {
    await fillOutAddress(page, relationship.mailingAddress, 'mailing', !relationship.deliveryAddress, parentLocator)
  }
  if (relationship.deliveryAddress) {
    await fillOutAddress(page, relationship.deliveryAddress, 'delivery', false, parentLocator)
  }
  if (cancel) {
    await selectCancel(parentLocator)
  } else {
    await selectDone(parentLocator)
  }
  expect(parentLocator).not.toBeVisible()
}
