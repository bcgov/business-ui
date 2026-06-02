import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'

export async function fillOutCertify(page: Page) {
  await expect(page.getByTestId('certify-section')).toBeVisible()
  await page.getByRole('checkbox', { name: /certify/i }).check({ force: true })
}
