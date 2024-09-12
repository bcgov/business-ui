import { expect, type Browser, chromium, type Page } from '@playwright/test'
import dotenv from 'dotenv'
// import { mockRoute } from './mock-route'
// load default env
// eslint-disable-next-line import/no-named-as-default-member
dotenv.config()

// checks if site is available before running setup
async function isServerReady (url: string, timeout: number = 30000): Promise<boolean> {
  const startTime = Date.now()
  while (Date.now() - startTime < timeout) { // loop until timeout is reached
    try {
      const response = await fetch(url) // try to ping site
      // return true if site is ready
      if (response.ok) {
        return true
      }
    } catch {
      // not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000)) // wait 1sec between fetches
  }
  return false // return false if reached timeout and no site is loaded
}

// handle auth setup
async function authSetup () {
  const baseURL = process.env.NUXT_BASE_URL!

  console.log('Waiting for the server to be ready...')
  const serverReady = await isServerReady(baseURL)
  if (!serverReady) {
    throw new Error(`Server at ${baseURL} did not become ready within the timeout period.`)
  }

  // launch browser and create page context
  const browser: Browser = await chromium.launch()
  const context = await browser.newContext()
  const page: Page = await context.newPage()

  // mock api call so login button is available
  // await mockRoute(page, '**/business/token/123', { json: mockedBusinessNano })

  // do login steps
  await page.goto(`${baseURL}en-CA?nanoid=123`) // navigate to home page with mocked token response
  await expect(page.getByText('File your BC Annual Report', { exact: true })).toBeVisible() // wait for page to be rendered
  await page.getByRole('button', { name: 'Login with BC Services Card' }).click()
  await page.getByLabel('Log in with Test with').click()
  await page.getByLabel('Email or username').click()
  await page.getByLabel('Email or username').fill(process.env.PLAYWRIGHT_TEST_USERNAME!)
  await page.getByLabel('Password').click()
  await page.getByLabel('Password').fill(process.env.PLAYWRIGHT_TEST_PASSWORD!)
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.reload() // keycloak redirect not working for some reason after login, refreshing the page works though
  expect(page.url()).toContain(`${baseURL}en-CA`)

  // write user data to file for re-use
  await page.context().storageState({ path: 'tests/e2e/.auth/user.json' })
  await browser.close() // cleanup browser
}

export default authSetup
