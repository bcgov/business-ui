import { test, expect } from '@playwright/test'
import { navigateToDodPage } from '../../test-utils'
import { mockCommonApiCallsForFiling } from '#test-mocks'
import { DISDE } from '~~/tests/mocks'

const identifier = 'BC1234567'

test.describe('Delay of Dissolution - Filing Submit', () => {
  test.beforeEach(async ({ page }) => {
    mockCommonApiCallsForFiling(page, identifier, undefined, DISDE)
    await navigateToDodPage(page, identifier)
    await page.waitForLoadState('networkidle')
  })

  test.describe('Non-Staff', () => {
    test('should submit the filing', async ({ page }) => {
      expect(page.getByRole('heading', { name: 'Delay of Dissolution or Cancellation' })).toBeVisible()
      await page.getByTestId('folio-input').fill('folio123')
      await page.getByTestId('legal-name-input').fill('Fred Jones')
      await page.getByRole('checkbox', { name: /certify/i }).check({ force: true })
      await page.getByRole('button', { name: 'Submit' }).click({ force: true })
      // should be redirected to business dashboard on success
      await page.waitForURL('**/dashboard/**', { timeout: 5000 })
      expect(page.url()).toContain('/dashboard')
    })
  })
})
