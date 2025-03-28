import { createResolver } from 'nuxt/kit'
import { defineConfig, devices } from '@playwright/test'
import type { ConfigOptions } from '@nuxt/test-utils/playwright'
import { config as dotenvConfig } from 'dotenv'
// load default env
dotenvConfig()

const { resolve } = createResolver(import.meta.url)

const devicesToTest = [
  'Desktop Chrome'
  // 'Desktop Firefox',
  // 'Desktop Safari'
  // Test against mobile viewports.
  // 'Pixel 5',
  // 'iPhone 12',
  // Test against branded browsers.
  // { ...devices['Desktop Edge'], channel: 'msedge' },
  // { ...devices['Desktop Chrome'], channel: 'chrome' },
] satisfies Array<string | typeof devices[string]>

export default defineConfig<ConfigOptions>({
  // globalSetup: './tests/e2e/test-utils/global-setup', // setup when booting test runner
  testDir: './tests/e2e',
  testIgnore: ['./tests/e2e/test-utils/**'],
  reporter: 'line',
  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,
  // Retry on CI only.
  // retries: process.env.CI ? 2 : 0,
  retries: 3, // a11y tests are flaky
  // maxFailures: 1,
  // workers: process.env.CI ? 1 : undefined, // Opt out of parallel tests on CI.
  // setting workers to 1 disables running tests in parallel
  workers: 4, // 4 seems to be the sweet spot
  use: {
    nuxt: {
      rootDir: resolve('./')
    },
    actionTimeout: 2000,
    baseURL: process.env.NUXT_BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'off',
    // do not open browser
    headless: true
  },
  projects: devicesToTest.map(p => typeof p === 'string' ? ({ name: p, use: devices[p] }) : p)
  // webServer: {
  //   // run dev server before starting tests
  //   command: 'pnpm dev --port 3000'
  // }
})
