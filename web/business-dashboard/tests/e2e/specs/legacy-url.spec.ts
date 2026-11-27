import { test, expect } from '@playwright/test'
import { DEFAULT_BUSINESS_NAME, DEFAULT_IDENTIFIER, setupDashboard } from '../test-utils'

test.describe('Legacy (unprefixed) urls', () => {
  test.beforeEach(async ({ page }) => {
    await setupDashboard(page, { navigate: false })
  })

  test('business url keeps its path and query under the default locale', async ({ page }) => {
    await page.goto(`/${DEFAULT_IDENTIFIER}?accountid=1&filing_id=123`)

    await expect(page).toHaveURL(new RegExp(`/en-CA/${DEFAULT_IDENTIFIER}\\?accountid=1&filing_id=123$`))
    await expect(page.getByTestId('business-dashboard')).toBeVisible()
    await expect(page.getByTestId('connect-tombstone-wrapper')).toContainText(DEFAULT_BUSINESS_NAME)
  })

  test('temporary registration url is redirected under the default locale', async ({ page }) => {
    await page.goto('/T1234567ab?filing_id=123')

    await expect(page).toHaveURL(/\/en-CA\/T1234567ab\?filing_id=123$/)
    await expect(page.getByTestId('business-dashboard')).toBeVisible()
  })

  test('entity error url is redirected under the default locale', async ({ page }) => {
    await page.goto(`/errors/entity/${DEFAULT_IDENTIFIER}`)

    await expect(page).toHaveURL(new RegExp(`/en-CA/errors/entity/${DEFAULT_IDENTIFIER}$`))
    await expect(page.getByTestId('entity-error')).toBeVisible()
  })

  test('locale prefixed url is left as is', async ({ page }) => {
    await page.goto(`/en-CA/${DEFAULT_IDENTIFIER}?accountid=1`)

    await expect(page.getByTestId('business-dashboard')).toBeVisible()
    await expect(page).toHaveURL(new RegExp(`/en-CA/${DEFAULT_IDENTIFIER}\\?accountid=1$`))
  })

  for (const root of ['/', '/en-CA']) {
    test(`root url ${root} goes to the registry home dashboard`, async ({ page }) => {
      const registryHomeDashboard = `${process.env.NUXT_PUBLIC_REGISTRY_HOME_URL}dashboard`
      await page.route(`${registryHomeDashboard}**`, async (route) => {
        await route.fulfill({ body: 'Playwright mocked registry home dashboard' })
      })

      await page.goto(root)

      await expect(page).toHaveURL(registryHomeDashboard)
    })
  }
})
