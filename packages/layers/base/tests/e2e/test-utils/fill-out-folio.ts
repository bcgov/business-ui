import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'

export async function fillOutFolio(page: Page, folio: string) {
  const folioInput = page.getByTestId('folio-input')
  await expect(folioInput).toBeVisible()
  await folioInput.fill(folio)
}
