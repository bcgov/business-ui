import { test, expect } from '@playwright/test'

test.describe('Filing Layout', () => {
  test('Should render correct elements', async ({ page }) => {
    await page.goto('./examples/layouts/filing')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Business Filing Layout').first()).toBeVisible()
    await expect(page.getByTestId('connect-header-wrapper')).toBeVisible()
    await expect(page.getByTestId('connect-breadcrumb-wrapper')).toBeVisible()
    await expect(page.getByTestId('business-filing-tombstone')).toBeVisible()
    const buttonControl = page.getByTestId('business-filing-button-control')
    await expect(buttonControl).toBeVisible()
    await expect(buttonControl.getByRole('button', { name: 'Left Button', exact: true })).toBeVisible()
    await expect(buttonControl.getByRole('button', { name: 'Right Button', exact: true })).toBeVisible()
    await expect(page.getByTestId('fee-widget')).toBeVisible()
  })
})
