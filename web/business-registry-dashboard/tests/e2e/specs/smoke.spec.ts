import { test, expect } from '@playwright/test'

test.describe('Smoke Tests', () => {
  test('dev server is running and responds', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.ok()).toBeTruthy()
  })

  test('unauthenticated user is redirected away from dashboard', async ({ page }) => {
    // The dashboard layout redirects unauthenticated users to the login page
    // Navigate and wait for the redirect to settle
    await page.goto('/en-CA')
    await page.waitForTimeout(5000)

    // The page URL should no longer be the dashboard — it should have redirected to the login page
    const url = page.url()
    const isRedirected = url.includes('login') || !url.includes('localhost:3000/en-CA')
    expect(isRedirected).toBeTruthy()
  })
})
