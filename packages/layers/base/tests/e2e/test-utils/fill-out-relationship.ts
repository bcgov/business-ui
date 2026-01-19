import type { Page } from '@playwright/test'

import { fillOutAddress } from './fill-out-address'
import { fillOutName } from './fill-out-name'
import { selectDone } from './select-done'

export async function fillOutNewRelationship(page: Page, relationship: BusinessRelationship) {
  const parentLocator = page.getByTestId('party-details-form')
  await fillOutName(page, relationship.entity)
  await fillOutAddress(page, relationship.deliveryAddress, 'delivery', !relationship.mailingAddress, parentLocator)
  if (relationship.mailingAddress) {
    await fillOutAddress(page, relationship.mailingAddress, 'mailing', false, parentLocator)
  }
  await selectDone(page)
}
