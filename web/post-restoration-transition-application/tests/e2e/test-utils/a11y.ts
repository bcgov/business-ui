import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

export async function scanA11y(page: Page) {
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

  expect(accessibilityScanResults.violations).toEqual([])
}
