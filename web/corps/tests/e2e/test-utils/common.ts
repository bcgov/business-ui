import { expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

/** Mocks the draft changes report as a 404, which resumes the draft as saved (no rebase). */
export async function mockDraftChangesNotFound(page: Page, identifier: string, filingId: string) {
  await page.route(`**/api/v2/businesses/${identifier}/filings/${filingId}/changes`, async (route) => {
    await route.fulfill({ status: 404, json: {} })
  })
}

/** Asserts the page shell every filing page renders (header, breadcrumb, tombstone, heading, fees, buttons). */
export async function assertCommonFilingElements(
  page: Page,
  options: { title: string, feeLabel?: string, isNoFee?: boolean }
) {
  const { title, feeLabel = title, isNoFee = false } = options
  await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })
  // has auth header
  await expect(page.getByTestId('connect-header-wrapper')).toBeVisible()
  // has breadcrumb
  await expect(page.getByTestId('connect-breadcrumb-wrapper')).toBeVisible()
  await expect(page.getByTestId('connect-breadcrumb-wrapper').getByText(title)).toBeVisible()
  // has tombstone
  await expect(page.getByTestId('connect-tombstone-wrapper')).toBeVisible()
  await expect(page.getByTestId('connect-tombstone-wrapper')
    .getByText('MCELROY ENTERPRISES LTD. - QA_IMPORT_TEST')
  ).toBeVisible()
  // has heading
  await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible()
  // has fee summary
  await expect(page.getByTestId('fee-widget')).toBeVisible()
  await expect(page.getByTestId('fee-widget').getByText(feeLabel)).toBeVisible()
  if (isNoFee) {
    await expect(page.getByTestId('fee-widget').getByText('No Fee')).toBeVisible()
  }
  // has buttons
  await expect(page.getByTestId('connect-button-control')).toBeVisible()
  // has footer
  await expect(page.getByTestId('connect-main-footer')).toBeVisible()
}

/** Asserts the office addresses table has exactly the given offices. */
export async function assertOfficeRows(page: Page, options: { present: string[], absent?: string[] }) {
  const tbody = page.getByTestId('office-addresses-section').locator('tbody')
  for (const office of options.present) {
    await expect(tbody).toContainText(office)
  }
  for (const office of options.absent ?? []) {
    await expect(tbody).not.toContainText(office)
  }
  await expect(tbody.locator('tr')).toHaveCount(options.present.length)
}

export async function assertDirectorCount(page: Page, count: number) {
  await expect(page.getByTestId('current-directors-section').locator('tbody').locator('tr')).toHaveCount(count)
}

/** Clicks Review and Confirm and waits for the given review step element to render. */
export async function goToReviewAndConfirm(page: Page, reviewStep: Locator) {
  await page.getByRole('button', { name: 'Review and Confirm' }).click()
  await expect(reviewStep).toBeVisible({ timeout: 10000 })
}

export async function fillCompletingPartyEmail(page: Page, email: string) {
  await page.getByTestId('completing-party-email-input').fill(email)
}

/** Asserts the page was redirected to the business dashboard after a successful submit or save. */
export async function assertFinalRedirect(page: Page, identifier: string) {
  await page.waitForURL(
    `${process.env.NUXT_PUBLIC_BUSINESS_DASHBOARD_URL}**`,
    { timeout: 10000, waitUntil: 'commit' }
  )
  expect(page.url()).toContain(`${process.env.NUXT_PUBLIC_BUSINESS_DASHBOARD_URL}${identifier}`)
}
