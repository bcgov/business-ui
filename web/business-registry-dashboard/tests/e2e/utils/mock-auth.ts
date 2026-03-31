/**
 * E2E Keycloak mock helpers for business-registry-dashboard.
 *
 * The BRD app uses `keycloak-js` via the core layer plugin (`01.keycloak.client.ts`).
 * That plugin does `new Keycloak(config)` then `keycloak.init({ onLoad: 'check-sso' })`.
 *
 * To test authenticated pages without real credentials, we:
 * 1. Use `page.addInitScript` to intercept the `Keycloak` constructor before the
 *    bundled keycloak-js module is evaluated.
 * 2. Mock all external API endpoints via `page.route()`.
 *
 * This must be called BEFORE `page.goto()`.
 */
import type { Page } from '@playwright/test'
import { mockRoute } from './mock-route'

/** Default mock token parsed payload (matches the shape keycloak-js exposes). */
const mockTokenParsed = {
  firstname: 'Test',
  lastname: 'User',
  name: 'Test User',
  username: 'testuser',
  email: 'test@example.com',
  sub: 'mock-keycloak-guid-123',
  loginSource: 'BCSC',
  realm_access: { roles: ['public_user'] }
}

/** Default mock account for session storage. */
const mockCurrentAccount = {
  id: '123',
  accessType: 'REGULAR',
  accountType: 'PREMIUM',
  accountStatus: 'ACTIVE',
  label: 'Test Account',
  type: 'PREMIUM',
  name: 'Test Account'
}

/**
 * Injects a Keycloak mock into the browser context before the app loads.
 * This replaces the real `keycloak-js` constructor with a mock that always returns
 * `authenticated: true` with a valid token.
 *
 * Must be called BEFORE `page.goto()`.
 */
export async function mockKeycloakSession (page: Page) {
  await page.addInitScript(`
    const _mockTokenParsed = ${JSON.stringify(mockTokenParsed)};
    const _mockCurrentAccount = ${JSON.stringify(mockCurrentAccount)};

    // Pre-seed session storage so the account store picks up the mock account
    sessionStorage.setItem('CURRENT_ACCOUNT', JSON.stringify(_mockCurrentAccount));

    // Create the mock Keycloak instance
    const mockKeycloakInstance = {
      authenticated: true,
      token: 'mock-jwt-token',
      tokenParsed: _mockTokenParsed,
      refreshToken: 'mock-refresh-token',
      idToken: 'mock-id-token',
      subject: _mockTokenParsed.sub,
      realmAccess: _mockTokenParsed.realm_access,
      init: () => Promise.resolve(true),
      login: () => Promise.resolve(),
      logout: () => Promise.resolve(),
      register: () => Promise.resolve(),
      accountManagement: () => Promise.resolve(),
      updateToken: () => Promise.resolve(true),
      clearToken: () => {},
      hasRealmRole: (role) => _mockTokenParsed.realm_access.roles.includes(role),
      hasResourceRole: () => false,
      isTokenExpired: () => false,
      loadUserProfile: () => Promise.resolve({}),
      loadUserInfo: () => Promise.resolve({}),
      onReady: null,
      onAuthSuccess: null,
      onAuthError: null,
      onAuthRefreshSuccess: null,
      onAuthRefreshError: null,
      onAuthLogout: null,
      onTokenExpired: null
    };

    // Store the mock instance globally so we can patch the Keycloak constructor
    window.__MOCK_KEYCLOAK_INSTANCE__ = mockKeycloakInstance;
  `)

  // Intercept the keycloak-js module chunk in the Vite bundle.
  // The bundled chunk exports a default Keycloak class constructor.
  // We replace it with a constructor that returns our mock instance.
  // Use /keycloak-js/ to only match the library module, not plugin files
  // (e.g. 01.keycloak.client.ts) that also contain "keycloak" in the path.
  await page.route(/keycloak-js/, async (route) => {
    await route.fulfill({
      contentType: 'application/javascript',
      body: `
          // Mock keycloak-js module
          function Keycloak() {
            return window.__MOCK_KEYCLOAK_INSTANCE__;
          }
          Keycloak.default = Keycloak;
          export { Keycloak as default };
        `
    })
  })

  // Block Keycloak OIDC discovery and auth endpoints
  await page.route('**/auth/realms/**', async (route) => {
    await route.fulfill({ status: 200, json: {} })
  })

  // Block Keycloak SSO iframe checks
  await page.route('**/loginproxy.gov.bc.ca/**', async (route) => {
    await route.fulfill({ status: 200, body: '' })
  })
}

/**
 * Mocks common API endpoints needed for the dashboard to render.
 * Call after mockKeycloakSession and before page.goto().
 */
export async function mockDashboardApis (
  page: Page,
  options: {
    affiliations?: object
    accountType?: string
  } = {}
) {
  const affiliations = options.affiliations ?? { entities: [] }
  const accountType = options.accountType ?? 'PREMIUM'

  // LaunchDarkly
  await page.route('https://app.launchdarkly.com/**', async (route) => {
    if (route.request().url().includes('evalx')) {
      await route.fulfill({ json: {} })
    } else if (route.request().url().includes('events')) {
      await route.fulfill({ status: 202 })
    } else {
      await route.fulfill({ json: {}, status: 200 })
    }
  })

  // User settings
  await mockRoute(page, '**/users/**/settings', {
    json: { type: 'USER_PROFILE', accountType, label: 'test-settings' }
  })

  // Affiliations — use specific API path to avoid matching Vite module URLs
  // (e.g. /_nuxt/stores/affiliations.ts would match **/affiliations**)
  await mockRoute(page, '**/orgs/**/affiliations**', { json: affiliations })

  // Permissions
  await mockRoute(page, '**/orgs/**/permissions', { json: {} })

  // Affiliation invitations — use api path prefix to avoid matching module URLs
  await mockRoute(page, '**/api/**/affiliationInvitations**', {
    json: { affiliationInvitations: [] }
  })

  // Products (for account validation)
  await page.route('**/orgs/**/products', async (route) => {
    await route.fulfill({
      json: [{ code: 'BUSINESS', subscriptionStatus: 'ACTIVE' }]
    })
  })

  // Account/org info
  await page.route('**/orgs/123', async (route) => {
    await route.fulfill({
      json: {
        id: 123,
        name: 'Test Account',
        accessType: 'REGULAR',
        orgType: 'PREMIUM',
        orgStatus: 'ACTIVE',
        statusCode: 'ACTIVE'
      }
    })
  })
}
