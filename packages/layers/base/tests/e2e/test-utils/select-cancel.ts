import { expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

export async function selectCancel(parentLocator: Page | Locator) {
  const cancelBtn = parentLocator.getByRole('button', { name: 'Cancel' })
  await expect(cancelBtn).toBeVisible()
  await cancelBtn.click()
}
