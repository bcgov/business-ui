import type { Page } from '@playwright/test'

export async function navigateToDodPage(page: Page, identifier: string) {
  // navigate to page
  await page.goto(`./en-CA/dissolution/${identifier}/delay`)
  // wait for api response to settle
  await page.waitForResponse('*/**/businesses/**/*')
}
