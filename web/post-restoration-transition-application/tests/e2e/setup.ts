import { chromium } from '@playwright/test'
import type { Browser, Page } from '@playwright/test'
import { config as dotenvConfig } from 'dotenv'

// load default env
dotenvConfig()

// checks if site is available before running setup
async function isServerReady(url: string, timeout: number = 30000): Promise<boolean> {
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

async function globalSetup() {
  console.info('Test setup starting...')
  const baseUrl = process.env.NUXT_PUBLIC_BASE_URL!
  // make sure app is available
  const serverReady = await isServerReady(baseUrl)
  if (!serverReady) {
    throw new Error(`Server at ${baseUrl} did not become ready within the timeout period.`)
  }

  // launch browser and create page context
  const browser: Browser = await chromium.launch()
  const context = await browser.newContext()
  const page: Page = await context.newPage()
  // complete login steps
  await page.goto(baseUrl)

  // TODO: figure out auth later
  // const username = process.env.PLAYWRIGHT_TEST_BCSC_USERNAME!
  // const password = process.env.PLAYWRIGHT_TEST_BCSC_PASSWORD!

  // await page.getByRole('button', { name: 'Select log in method' }).click()
  // await page.getByRole('menuitem', { name: 'BC Services Card' }).click()
  // await page.getByLabel('Log in with Test with').click()
  // await page.getByLabel('Email or username').fill(username)
  // await page.getByLabel('Password').fill(password)
  // await page.getByRole('button', { name: 'Continue' }).click()

  // // should be redirected back to baseUrl after successful login
  // await page.waitForURL(baseUrl + '**')

  // // save auth state and close browser
  // await page.context().storageState({ path: 'tests/e2e/.auth/bcsc-user.json' })
  await browser.close()
  console.info('Test setup completed.')
}

export default globalSetup
