import { expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

export async function selectDone(parentLocator: Page | Locator) {
  const doneBtn = parentLocator.getByRole('button', { name: 'Done' })
  await expect(doneBtn).toBeVisible()
  await doneBtn.click()
}
