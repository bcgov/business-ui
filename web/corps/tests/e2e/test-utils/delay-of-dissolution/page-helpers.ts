import type { Page } from '@playwright/test'

export async function navigateToDodPage(page: Page, identifier: string) {
  // navigate to page, waiting for the api response to settle
  await Promise.all([
    page.waitForResponse('*/**/businesses/**/*'),
    page.goto(`./en-CA/dissolution/${identifier}/delay`)
  ])
}
