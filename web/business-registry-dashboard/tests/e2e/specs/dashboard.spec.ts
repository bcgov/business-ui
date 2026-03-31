import { test, expect } from '@playwright/test'
import { mockKeycloakSession, mockDashboardApis } from '../utils/mock-auth'

test.describe('Dashboard - Authenticated', () => {
  test('dashboard page renders heading and intro text', async ({ page }) => {
    await mockKeycloakSession(page)
    await mockDashboardApis(page)
    await page.goto('/en-CA')
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible({ timeout: 15000 })
    const h1Text = await h1.textContent()
    expect(h1Text?.trim()).toMatch(/My (Staff )?Business Registry/)
    await expect(page.getByText('Start B.C. based businesses and keep business records up to date.')).toBeVisible()
  })

  test('dashboard shows empty state with no affiliations', async ({ page }) => {
    await mockKeycloakSession(page)
    await mockDashboardApis(page)
    await page.goto('/en-CA')
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible({ timeout: 15000 })
    await expect(page.getByText('ABC COMPANY TEST ENTITY INC.')).not.toBeVisible()
  })
})
