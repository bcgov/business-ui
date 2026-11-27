import { test, expect } from '@playwright/test'
import { DEFAULT_BUSINESS_NAME, DEFAULT_IDENTIFIER, scanA11y, setupDashboard } from '../test-utils'

test.describe('Dashboard layout', () => {
  test('renders the header, breadcrumb, tombstone and footer', async ({ page }) => {
    await setupDashboard(page)

    await expect(page.getByTestId('connect-header-wrapper')).toBeVisible()
    await expect(page.getByTestId('connect-breadcrumb-wrapper')).toBeVisible()
    await expect(page.getByTestId('connect-tombstone-wrapper').getByRole('heading', { level: 1 }))
      .toHaveText(DEFAULT_BUSINESS_NAME)
    await expect(page.getByTestId('business-dashboard')).toBeVisible()
    await expect(page.getByRole('contentinfo')).toBeVisible()
  })

  test('shows the loading spinner until the business has loaded', async ({ page }) => {
    await setupDashboard(page, { navigate: false })
    let releaseBusiness = () => {}
    const businessHeld = new Promise<void>((resolve) => {
      releaseBusiness = resolve
    })
    await page.route(`**/api/v2/businesses/${DEFAULT_IDENTIFIER}?slim=true`, async (route) => {
      await businessHeld
      await route.fallback()
    })

    await page.goto(`./en-CA/${DEFAULT_IDENTIFIER}`)

    const spinner = page.locator('svg.spinner')
    await expect(spinner).toBeVisible()
    releaseBusiness()
    await expect(spinner).toBeHidden()
    await expect(page.getByTestId('connect-tombstone-wrapper')).toContainText(DEFAULT_BUSINESS_NAME)
  })

  test.describe('breadcrumb', () => {
    test('non-staff account', async ({ page }) => {
      await setupDashboard(page)

      const crumbs = page.getByTestId('connect-breadcrumb-wrapper').getByRole('listitem')
      await expect(crumbs).toHaveText(['BC Registries Dashboard', 'My Business Registry', DEFAULT_BUSINESS_NAME])
    })

    test('staff account', async ({ page }) => {
      await setupDashboard(page, { accountType: 'STAFF' })

      const crumbs = page.getByTestId('connect-breadcrumb-wrapper').getByRole('listitem')
      await expect(crumbs).toHaveText(['Staff Dashboard', 'My Staff Business Registry', DEFAULT_BUSINESS_NAME])
    })
  })

  test('passes accessibility', async ({ page }) => {
    await setupDashboard(page)
    await expect(page.getByTestId('connect-tombstone-wrapper')).toContainText(DEFAULT_BUSINESS_NAME)

    // known upstream layer gaps, not app markup
    // - account options button: aria-label does not contain the visible account name
    // - region rule: system banner and tombstone sit outside a landmark in ConnectLayout
    await scanA11y(page, ['#account-options-button'], ['region'])
  })
})
