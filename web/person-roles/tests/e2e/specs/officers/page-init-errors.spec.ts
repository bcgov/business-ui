import { test, expect } from '@playwright/test'
import { setupOfficerChangePage, navigateToOfficerChangePage } from '../../test-utils'
import { businessBC1234567 } from '~~/tests/mocks'

const identifier = businessBC1234567.business.identifier

test.describe('Page init errors', () => {
  // test.use({ storageState: 'tests/e2e/.auth/bcsc-user.json' })

  test.beforeEach(async ({ page }) => {
    await setupOfficerChangePage(page, false)
  })

  test.describe('Business Fetch Errors', () => {
    const testCases = [
      { status: 400, expectedText: 'Page Not Found' },
      { status: 503, expectedText: 'Page Not Found' },
      { status: 500, expectedText: 'Page Not Found' },
      { status: 404, expectedText: 'Invalid Link' },
      { status: 401, expectedText: 'Access Restricted' },
      { status: 403, expectedText: 'Access Restricted' }
    ]

    testCases.forEach(({ status, expectedText }) => {
      test(`should display "${expectedText}" modal if the business fetch fails with ${status}`, async ({ page }) => {
        await page.route(`*/**/businesses/${identifier}`, async (route) => {
          await route.fulfill({ status })
        })

        // navigate to page and wait for settled state
        await navigateToOfficerChangePage(page)

        // assert modal content
        const modal = page.getByRole('dialog')
        await expect(modal).toBeVisible()
        await expect(modal).toContainText(expectedText)
      })
    })

    testCases.forEach(({ status, expectedText }) => {
      test(`should display "${expectedText}" modal if the auth fetch fails with ${status}`, async ({ page }) => {
        await page.route(`*/**/entities/${identifier}`, async (route) => {
          await route.fulfill({ status })
        })

        // navigate to page and wait for settled state
        await navigateToOfficerChangePage(page)

        // assert modal content
        const modal = page.getByRole('dialog')
        await expect(modal).toBeVisible()
        await expect(modal).toContainText(expectedText)
      })
    })

    testCases.forEach(({ status, expectedText }) => {
      test(`should display "${expectedText}" modal if the parties fetch fails with ${status}`, async ({ page }) => {
        await page.route(`*/**/businesses/${identifier}/parties?classType=officer`, async (route) => {
          await route.fulfill({ status })
        })

        // navigate to page and wait for settled state
        await navigateToOfficerChangePage(page)

        // assert modal content
        const modal = page.getByRole('dialog')
        await expect(modal).toBeVisible()
        await expect(modal).toContainText(expectedText)
      })
    })
  })

  test('should display "Page not available" modal if filing not allowed for business', async ({ page }) => {
    await page.route(`*/**/businesses/${identifier}`, async (route) => {
      await route.fulfill({
        json: {
          business: {
            ...businessBC1234567,
            allowedActions: {
              filing: {
                filingTypes: [] // change of officers not in allowed filings list
              },
              viewAll: false
            }
          }
        }
      })
    })

    // navigate to page and wait for settled state
    await navigateToOfficerChangePage(page)

    // assert modal content
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    await expect(modal).toContainText('Page not available')
    await expect(modal).toContainText(
      // eslint-disable-next-line max-len
      'This page is not available for this business. Check that your business type hasn’t changed and if any drafts or tasks are waiting to be completed.'
    )
  })

  test.describe('Draft Filing Fetch Errors', () => {
    test('should display "Page Not Found" modal if draft filing returns 404', async ({ page }) => {
      await page.route(`*/**/businesses/${identifier}/filings/123`, async (route) => {
        await route.fulfill({ status: 404 })
      })

      // navigate to page and wait for settled state
      await page.goto(`./en-CA/officer-change/${identifier}?draft=123`)
      await page.waitForResponse('*/**/businesses/**/*')
      await expect(page.getByText('Officer Change').first()).toBeVisible()

      // assert modal content
      const modal = page.getByRole('dialog')
      await expect(modal).toBeVisible()
      await expect(modal).toContainText('Page not found')
      await expect(modal).toContainText(
        // eslint-disable-next-line max-len
        'We cannot display this page right now. Try refreshing the page or go back to the main page of this business.Page not foundWe cannot display this page right now. Try refreshing the page or go back to the main page of this business.'
      )
    })

    test('should display "Page not Found" modal if draft filing has invalid structure', async ({ page }) => {
      await page.route(`*/**/businesses/${identifier}/filings/123`, async (route) => {
        await route.fulfill({
          json: {
            filing: {
              header: {
                name: 'changeOfDirectors', // draft filing but wrong type
                certifiedBy: 'Test User',
                accountId: 1234,
                date: '2025-09-09',
                filingId: 123,
                status: 'DRAFT'
              },
              business: businessBC1234567.business,
              changeOfDirectors: {}
            }
          }
        })
      })

      // navigate to page and wait for settled state
      await page.goto(`./en-CA/officer-change/${identifier}?draft=123`)
      await page.waitForResponse('*/**/businesses/**/*')
      await expect(page.getByText('Officer Change').first()).toBeVisible()

      // assert modal content
      const modal = page.getByRole('dialog')
      await expect(modal).toBeVisible()
      await expect(modal).toContainText('Page not found')
      await expect(modal).toContainText(
        'We cannot display this page right now.'
      )
    })
  })
})
