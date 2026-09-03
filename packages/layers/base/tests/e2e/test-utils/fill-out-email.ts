import { expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

export async function fillOutEmail(parentLocator: Page | Locator, email: string) {
  const emailInput = parentLocator.getByTestId('party-email-input')
  const isVisible = await emailInput.isVisible()

  if (!isVisible) {
    // email section is hidden so return
    return
  }

  await expect(emailInput).toBeVisible()
  await emailInput.fill(email)
}
