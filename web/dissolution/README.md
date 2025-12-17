# Dissolution Home UI

## Tech
- Framework: [Nuxt 4](https://nuxt.com/)
- UI Library: [Nuxt UI v4](https://ui.nuxt.com/)

## Development and Contributing

Please review the [Code of Conduct](./CODE_OF_CONDUCT.md) and [Contributing](./CONTRIBUTING.md) guidelines before contributing to this project to ensure a positive and productive experience for everyone.

Create a fork and local copy of this repo. Answer _Y_ to create a local clone.
```bash
gh repo fork bcgov/business-ui
```

> [!IMPORTANT]
> Ensure you have the env variables as defined in the `.env.example` file.
Change into the directory and install the packages.
```bash
cd bcgov/business-ui/dissolution
pnpm install
```

Startup the development environment.
```bash
pnpm run dev
```

## Build and Preview

Build the static site
```bash
pnpm run generate
```

Locally preview the static site
```bash
npx serve .output/public
```

## Testing

### Unit

Unit testing is configured to use the following libraries:

- [Vitest](https://vitest.dev/guide/) - test runner
- [Vitest Coverage](https://vitest.dev/guide/coverage) - test coverage
- [Nuxt Test Utils](https://nuxt.com/docs/getting-started/testing?utm_source=nuxt.com&utm_medium=aside-module&utm_campaign=nuxt.com) - nuxt specific test utils
- [@testing-library/vue](https://testing-library.com/docs/vue-testing-library/intro/) - test utils
- [Vue Test Utils](https://test-utils.vuejs.org/guide/) - test utils

To run Vitest:
```bash
pnpm test:unit
```

To run Vitest Coverage:
```bash
pnpm test:unit:cov
```

### E2E

Unit testing is configured to use the following libraries:

- [Playwright](https://playwright.dev/docs/intro) - test runner
- [Axe Core Playwright](https://playwright.dev/docs/accessibility-testing) - accessibility testing

**Please use [Faker](https://fakerjs.dev/guide/) to generate unique test data**

To run Playwright in the terminal:
```bash
pnpm test:e2e
```

To run Playwright in ui mode:
```bash
pnpm test:e2e:ui
```

#### Playwright Config

The globalSetup option will create and save an auth user state which can then be used inside other tests:
```js
  globalSetup: './tests/e2e/setup',
```

To use this auth state:
```js
  test.describe('Describe Block', () => {
    test.use({ storageState: `tests/e2e/.auth/bcsc-user.json` })

    test('My Test', async ({ page }) => {
      // stuff
    })
  })
```

To run tests in headless mode, set the headless property in the Playwright config:
```js
  use: {
    headless: true
  }
```

#### Environment Variables Setup

Before running any e2e tests, ensure the `.env` file has the correct values. Missing or incorrect values will lead to test failures. Below are the required environment variables:

```
# playwright login
PLAYWRIGHT_TEST_BCSC_USERNAME=""
PLAYWRIGHT_TEST_BCSC_PASSWORD=""
# The full url the tests will run against (local/dev/test/sandbox)
NUXT_PUBLIC_BASE_URL=""
```

#### Important

- A maximum of 4 workers seems to be the sweet spot for tests to pass without colliding with each other.
- Setting to 1 worker will fully disable running tests in parallel.
- Using the Playwright extension/testing tab does not execute the global setup and save the auth state. You must run `pnpm:e2e` to at least create the auth files before running tests with the extension.