import { expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

export async function selectDone(page: Page, parent?: Locator) {
  const parentLocator = parent ?? page
  const doneBtn = parentLocator.getByRole('button', { name: 'Done' })
  await expect(doneBtn).toBeVisible()
  await doneBtn.click()
}
