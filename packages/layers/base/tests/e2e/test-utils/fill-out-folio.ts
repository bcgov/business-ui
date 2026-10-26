import { expect, type Page } from '@playwright/test'

export async function fillOutFolio(page: Page, folio: string) {
  // businesses with a folio on file get a choice first; pick a number for this transaction only
  const transactionOption = page.getByTestId('folio-option').getByRole('radio').nth(1)
  if (await transactionOption.count()) {
    await transactionOption.click()
  }
  const folioInput = page.getByTestId('folio-input')
  await expect(folioInput).toBeVisible()
  await folioInput.fill(folio)
}
