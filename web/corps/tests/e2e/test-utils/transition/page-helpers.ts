import type { Page } from '@playwright/test'

export async function navigateToTransitionPage(page: Page, identifier: string) {
  // navigate to page
  await page.goto(`./en-CA/transition/${identifier}`)
  // wait for api response to settle
  await page.waitForResponse('*/**/businesses/**/*')
}
