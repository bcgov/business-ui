import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'
import {
  // NOCOI,
  businessBC1234567,
  tasksBC1234567,
  authInfoBC1234567
  // partiesBC1234567
} from '~~/tests/mocks'
// import type { getFakePerson, getFakeAddress } from './data'
// import { provinceSubdivisions } from './data'
// import { getPermissionsMock } from '#testMocks/business-permissions'

const identifier = businessBC1234567.business.identifier

export async function navigateToDodPage(page: Page) {
  // navigate to page
  await page.goto(`./en-CA/delay/${identifier}`)
  // wait for api response to settle
  await page.waitForResponse('*/**/businesses/**/*')
  // wait for heading, this will wait for the loading state to finish on initial page mount
  await expect(page.getByText('Delay of Dissolution or Cancellation').first()).toBeVisible()
}
