import type { Page } from '@playwright/test'
import { goToReviewAndConfirm } from '../common'

export async function navigateToTransitionPage(page: Page, identifier: string) {
  // navigate to page, waiting for the api response to settle
  await Promise.all([
    page.waitForResponse('*/**/businesses/**/*'),
    page.goto(`./en-CA/transition/${identifier}`)
  ])
}

export async function goToTransitionReviewStep(page: Page) {
  await goToReviewAndConfirm(page, page.getByTestId('document-delivery-section'))
}
