import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'

export async function fillOutCourtOrder(page: Page, courtOrder: CourtOrderPoaSchema) {
  const courtOrderPoaCheckbox = page.getByRole('checkbox', { name: 'This filing is pursuant to a Plan of Arrangement' })
  const courtOrderInput = page.getByTestId('court-order-number-input')
  await expect(courtOrderPoaCheckbox).toBeVisible()
  if (courtOrder.hasPoa) {
    await courtOrderPoaCheckbox.check()
  }
  await expect(courtOrderInput).toBeVisible()
  if (courtOrder.courtOrderNumber) {
    await courtOrderInput.fill(courtOrder.courtOrderNumber)
  }
}
