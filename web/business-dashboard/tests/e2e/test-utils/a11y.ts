import AxeBuilder from '@axe-core/playwright'
import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'

export async function scanA11y(page: Page, exclude: string[] = [], disabledRules: string[] = []) {
  const accessibilityScanResults = await new AxeBuilder({ page })
    .exclude(exclude)
    .disableRules(disabledRules)
    .analyze()

  expect(accessibilityScanResults.violations).toEqual([])
}
