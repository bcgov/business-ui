import { expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

export async function fillOutNrNumber(parentLocator: Page | Locator, nrNumber: string) {
  const nrNumInput = parentLocator.getByTestId('nr-number-input')
  await expect(nrNumInput).toBeVisible()
  await nrNumInput.fill(nrNumber)
  // await 1 second for debounce
  await new Promise(resolve => setTimeout(resolve, 1000))
}
