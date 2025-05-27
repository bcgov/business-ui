[![License](https://img.shields.io/badge/License-BSD%203%20Clause-blue.svg)](LICENSE)

# Business Registry Dashboard UI

## Development & Contributing

Create a fork and local copy of this repo. Answer _Y_ to create a local clone.
```bash
gh repo fork bcgov/business-ui
```

Change into the directory and install the packages.
```bash
cd business-ui/business-registry-dashboard
pnpm install
```

Startup the development environment.
```bash
pnpm run dev
```

## Testing

Run Vitest in watch mode for unit tests
```bash
pnpm test
or
pnpm test:unit
```

Run Vitest Coverage in watch mode for unit tests
```bash
pnpm test
or
pnpm test:unit:cov
```

Run Playwright e2e tests in headless mode
```bash
pnpm test:e2e
```

Run Playwright e2e tests in Playwright UI
```bash
pnpm test:e2e:ui
```
