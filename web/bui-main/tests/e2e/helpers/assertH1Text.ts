import { expect, type Page } from '@playwright/test'
export async function assertH1Text (page: Page, expectedText: string) {
  const h1 = await page.textContent('h1')
  expect(h1?.trim()).toBe(expectedText)
  expect(h1).toBeTruthy()
}
