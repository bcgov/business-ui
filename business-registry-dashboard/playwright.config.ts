import { fileURLToPath } from 'node:url'
import { defineConfig, devices } from '@playwright/test'
import type { ConfigOptions } from '@nuxt/test-utils/playwright'

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
  globalSetup: './tests/e2e/utils/auth-setup',
  testDir: './tests/e2e',
  reporter: 'line',
  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,

  // Retry on CI only.
  // retries: process.env.CI ? 2 : 0,
  retries: 3, // a11y tests are flaky

  // Opt out of parallel tests on CI.
  // workers: process.env.CI ? 1 : undefined,
  use: {
    nuxt: {
      rootDir: fileURLToPath(new URL('.', import.meta.url))
    },
    actionTimeout: 0,
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'off',
    // do not open browser
    headless: true
  },
  projects: devicesToTest.map(p => typeof p === 'string' ? ({ name: p, use: devices[p] }) : p),
  webServer: {
    // run dev server before starting tests
    command: 'pnpm dev --port 3000'
  }
})
