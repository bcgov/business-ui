import { expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

// The combined jurisdiction combobox retains its previous selection's label and only
// opens on focus from a fresh focus - clear then type to filter/open it, then confirm.
export async function pickJurisdiction(page: Page, combobox: Locator, optionText: string) {
  await combobox.click()
  await combobox.fill('') // clear any previously selected label - typing appends
  await page.keyboard.type(optionText) // typing opens and filters the menu
  const optionsList = page.getByRole('listbox') // listbox is a teleport on the page body
  await expect(optionsList).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(optionsList).not.toBeVisible()
}
