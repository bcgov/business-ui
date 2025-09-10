import { test, expect } from '@playwright/test'
import { setupOfficerChangePage } from '../test-utils'
import { businessBC1234567 } from '~~/tests/mocks'
import en from '~~/i18n/locales/en-CA'

test.describe('Page init errors', () => {
  // test.use({ storageState: 'tests/e2e/.auth/bcsc-user.json' })

  const identifier = 'BC1234567'

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
        await page.goto(`./en-CA/officer-change/${identifier}`)
        await expect(page.getByText('Officer Change').first()).toBeVisible()

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
        await page.goto(`./en-CA/officer-change/${identifier}`)
        await expect(page.getByText('Officer Change').first()).toBeVisible()

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
        await page.goto(`./en-CA/officer-change/${identifier}`)
        await expect(page.getByText('Officer Change').first()).toBeVisible()

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
    await page.goto(`./en-CA/officer-change/${identifier}`)
    await expect(page.getByText('Officer Change').first()).toBeVisible()

    // assert modal content
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    await expect(modal).toContainText(en.modal.error.filingNotAllowed.undefined.title)
    await expect(modal).toContainText(en.modal.error.filingNotAllowed.undefined.description)
  })

  test('should display "Page not available" modal if business has pending tasks', async ({ page }) => {
    await page.route(`*/**/businesses/${identifier}/tasks`, async (route) => {
      await route.fulfill({
        json: {
          tasks: [
            {
              enabled: true,
              order: 1,
              task: {
                filing: {
                  business: businessBC1234567,
                  changeOfDirectors: {},
                  header: {
                    status: 'DRAFT'
                  }
                }
              }
            }
          ]
        }
      })
    })

    // navigate to page and wait for settled state
    await page.goto(`./en-CA/officer-change/${identifier}`)
    await expect(page.getByText('Officer Change').first()).toBeVisible()

    // assert modal content
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    await expect(modal).toContainText(en.modal.error.filingNotAllowed.undefined.title)
    await expect(modal).toContainText(en.modal.error.filingNotAllowed.undefined.description)
  })

  test.describe('Draft Filing Fetch Errors', () => {
    test('should display "Page not Found" modal if draft filing returns 404', async ({ page }) => {
      await page.route(`*/**/businesses/${identifier}/filings/123`, async (route) => {
        await route.fulfill({ status: 404 })
      })

      // navigate to page and wait for settled state
      await page.goto(`./en-CA/officer-change/${identifier}?draft=123`)
      await expect(page.getByText('Officer Change').first()).toBeVisible()

      // assert modal content
      const modal = page.getByRole('dialog')
      await expect(modal).toBeVisible()
      await expect(modal).toContainText(en.modal.error.getDraftFiling.undefined.title)
      await expect(modal).toContainText(en.modal.error.getDraftFiling.undefined.description)
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
      await expect(page.getByText('Officer Change').first()).toBeVisible()

      // assert modal content
      const modal = page.getByRole('dialog')
      await expect(modal).toBeVisible()
      await expect(modal).toContainText(en.modal.error.getDraftFiling.undefined.title)
      await expect(modal).toContainText(en.modal.error.getDraftFiling.undefined.description)
    })
  })
})
