import type { Page } from '@playwright/test'

import { fillOutAddress } from './fill-out-address'
import { fillOutName } from './fill-out-name'
import { selectDone } from './select-done'

export async function fillOutNewRelationship(page: Page, relationship: BusinessRelationship) {
  await fillOutName(page, relationship.entity)
  await fillOutAddress(page, relationship.deliveryAddress)
  await selectDone(page)
}
