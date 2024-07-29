import { expect, type Page } from '@playwright/test'
export async function assertAlertText (page: Page, expectedTitle: string, expectedDescription: string) {
  // assert alert text
  const alert = page.getByTestId('sbc-alert')
  await expect(alert).toBeVisible()
  await expect(alert).toContainText(expectedTitle)
  await expect(alert).toContainText(expectedDescription)
}
