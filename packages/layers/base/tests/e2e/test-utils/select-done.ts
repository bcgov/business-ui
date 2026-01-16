import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'

export async function selectDone(page: Page) {
  const doneBtn = page.getByRole('button', { name: 'Done' })
  await expect(doneBtn).toBeVisible()
  await doneBtn.click()
}
