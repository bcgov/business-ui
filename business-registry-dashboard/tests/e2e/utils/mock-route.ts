import { type Page } from '@playwright/test'
export async function mockRoute (page: Page, url: string, response: any) {
  await page.route(url, async (route) => {
    await route.fulfill(response)
  })
}
