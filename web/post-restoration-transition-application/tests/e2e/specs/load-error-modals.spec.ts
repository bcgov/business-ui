import { test, expect } from '@playwright/test'
import { CP1002605 } from '../../mocks/lear/business'
import { impersonateUser, mockForIdentifier } from '../test-utils/helpers'

test.describe('Error Modals', () => {
  const identifier = CP1002605.business.identifier
  test.beforeEach(async ({ page }) => {
    await impersonateUser(page, 'business')
    await mockForIdentifier(page, identifier)
  })
  test('Undefined Modal', async ({ page }) => {
    await page.goto(`./en-CA/undefined`)
    await expect(page.getByText(/^(Access Restricted|Invalid Link)$/).first()).toBeVisible()
    await expect(page.locator('a').getByText('Go to My Business Registry').first()).toBeVisible()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('404 Modal', async ({ page }) => {
    await page.route(`*/**/entities/${identifier}`, async (route) => {
      await route.fulfill({ status: 404 })
    })
    await page.goto(`./en-CA/${identifier}`)
    await expect(page.getByText('Invalid Link').first()).toBeVisible()
    await expect(page.locator('a').getByText('Go to My Business Registry').first()).toBeVisible()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('401 Modal', async ({ page }) => {
    await page.route(`*/**/entities/${identifier}`, async (route) => {
      await route.fulfill({ status: 401 })
    })
    await page.goto(`./en-CA/${identifier}`)
    await expect(page.getByText('Access Restricted').first()).toBeVisible()
    await expect(page.locator('a').getByText('Go to My Business Registry').first()).toBeVisible()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('403 Modal', async ({ page }) => {
    await page.route(`*/**/entities/${identifier}`, async (route) => {
      await route.fulfill({ status: 403 })
    })
    await page.goto(`./en-CA/${identifier}`)
    await expect(page.getByText('Access Restricted').first()).toBeVisible()
    await expect(page.locator('a').getByText('Go to My Business Registry').first()).toBeVisible()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('500 Modal', async ({ page }) => {
    await page.route(`*/**/entities/${identifier}`, async (route) => {
      await route.fulfill({ status: 500 })
    })
    await page.goto(`./en-CA/${identifier}`)
    await expect(page.getByText('Page Not Found').first()).toBeVisible()
    await expect(page.locator('button').getByText('Refresh Page').first()).toBeVisible()
    await expect(page.locator('button').getByText('Go Back').first()).toBeVisible()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('400 Modal', async ({ page }) => {
    await page.route(`*/**/entities/${identifier}`, async (route) => {
      await route.fulfill({ status: 400 })
    })
    await page.goto(`./en-CA/${identifier}`)
    await expect(page.getByText('Page Not Found').first()).toBeVisible()
    await expect(page.locator('button').getByText('Close').first()).toBeVisible()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('No Modal', async ({ page }) => {
    await page.goto(`./en-CA/${identifier}`)
    await expect(page.getByRole('heading', { name: 'Post Restoration Transition Application' })).toBeVisible()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })
})
