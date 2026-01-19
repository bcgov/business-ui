import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'

export async function fillOutCertify(page: Page, legalName: string) {
  const certifyNameInput = page.getByTestId('certify-section').getByTestId('legal-name-input')
  await expect(certifyNameInput).toBeVisible()
  await certifyNameInput.fill(legalName)
  await page.getByRole('checkbox', { name: /certify/i }).check({ force: true })
}
