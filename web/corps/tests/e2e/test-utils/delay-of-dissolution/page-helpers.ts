import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export async function navigateToDodPage(page: Page, identifier: string) {
  // navigate to page
  await page.goto(`./en-CA/dissolution/${identifier}/delay`)
  // wait for api response to settle
  await page.waitForResponse('*/**/businesses/**/*')
  // wait for heading, this will wait for the loading state to finish on initial page mount
  await expect(page.getByText('Delay of Dissolution or Cancellation').first()).toBeVisible()
}
