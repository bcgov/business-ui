/**
 * E2E mock helpers for the COLIN affiliation flow.
 */
import type { Page } from '@playwright/test'
import { mockKeycloakSession, mockDashboardApis } from './mock-auth'
import { mockLaunchDarkly } from './mock-ld'

export interface ColinBusinessMockOptions {
  identifier?: string
  legalType?: string
  name?: string
  /** LD flags to (attempt to) seed - see caveat in mock-ld.ts */
  flags?: Record<string, unknown>
  syncStatus?: number
  contactsStatus?: number
  contactsEmail?: string
  orgsAffiliationStatus?: number
  orgsDetails?: Array<{ branchName?: string, name: string, uuid: string }>
  authenticationStatus?: number
  hasValidPassCode?: boolean
  /**
   * `modernized` on the search result. False (the default) marks the business as COLIN-only, which
   * makes ManageBusiness.vue skip the LEAR lookup entirely - so set this true alongside
   * `isLearBusiness` when a test needs the modernized path.
   */
  modernized?: boolean
  /** Whether GET /businesses/{identifier}?slim=true resolves (business already in LEAR) or 404s (COLIN-only) */
  isLearBusiness?: boolean
  /**
   * Businesses already affiliated to the account (returned by the affiliations GET).
   * NB: loadAffiliations only processes pending invitations when the account has at
   * least one affiliated business, so invite-flow tests need one of these.
   */
  existingAffiliations?: Array<{ identifier: string, legalName: string, legalType: string }>
}

export interface ColinBusinessMockHandles {
  /** Labels pushed, in request order, as each mocked endpoint is hit */
  callOrder: string[]
}

const defaultAccountAuthorizedActions = ['SEARCH_BUSINESS_NR', 'MANAGE_BUSINESS']

// NB: `allowable-business-passcode-types` is read in ManageBusiness.vue as
// `ldStore.getStoredFlag(...).includes(...)` with NO `|| ''` fallback (unlike every
// other flag read in this codebase), so it throws if the flag set omits the key.
// Default it to an empty string here so tests that don't care about the passcode
// option stay correct-by-construction.
const defaultFlags: Record<string, unknown> = {
  'allowable-business-passcode-types': ''
}

export async function mockColinBusinessFlow (
  page: Page,
  options: ColinBusinessMockOptions = {}
): Promise<ColinBusinessMockHandles> {
  const identifier = options.identifier ?? 'BC0870226'
  const legalType = options.legalType ?? 'BC'
  const name = options.name ?? 'COLIN TEST COMPANY'
  const flags = { ...defaultFlags, ...options.flags }
  const syncStatus = options.syncStatus ?? 200
  const contactsStatus = options.contactsStatus ?? 200
  const contactsEmail = options.contactsEmail ?? 'contact@example.com'
  const orgsAffiliationStatus = options.orgsAffiliationStatus ?? 200
  const orgsDetails = options.orgsDetails ?? []
  const authenticationStatus = options.authenticationStatus ?? 200
  const hasValidPassCode = options.hasValidPassCode ?? true
  const modernized = options.modernized ?? false
  const isLearBusiness = options.isLearBusiness ?? false
  const existingAffiliations = options.existingAffiliations ?? []

  const handles: ColinBusinessMockHandles = { callOrder: [] }

  // Surface uncaught page errors in the test output - a crashed page otherwise just
  // shows up as "element not found" on whatever the test asserts next.
  page.on('pageerror', (error) => {
    // eslint-disable-next-line no-console
    console.error(`Page error: ${error.stack ?? error.message}`)
  })

  // Unmocked API calls fail loudly instead of hitting a real backend.
  // Playwright consults route handlers in reverse order, so it needs to come FIRST
  // otherwise it will overwrite every other mock
  await page.route('**/*', async (route) => {
    const resourceType = route.request().resourceType()
    const url = route.request().url()
    // Nuxt internals (eg. the /_nuxt/builds/meta app manifest fetched on navigation) must
    // reach the dev server - aborting the manifest fetch sends the router to the error page.
    if ((resourceType === 'fetch' || resourceType === 'xhr') && !url.includes('/_nuxt/')) {
      // eslint-disable-next-line no-console
      console.error(`Unmocked API call: ${route.request().method()} ${url}`)
      await route.abort('failed')
    } else {
      await route.continue()
    }
  })

  // Icon metadata lookups (UIcon) - harmless, stub them out instead of failing loudly
  await page.route('**/api.iconify.design/**', async (route) => {
    await route.fulfill({ json: {} })
  })

  await mockKeycloakSession(page)
  await mockDashboardApis(page)
  await mockLaunchDarkly(page, flags)

  // Affiliation create + list. Stateful (registered after mockDashboardApis so it wins)
  // so that the table reload after a successful add returns the newly added business.
  let affiliated = false
  await page.route('**/orgs/**/affiliations**', async (route) => {
    if (route.request().method() === 'POST') {
      handles.callOrder.push('create-affiliation')
      affiliated = true
      await route.fulfill({ status: 201, json: {} })
    } else {
      handles.callOrder.push('affiliations')
      await route.fulfill({
        json: {
          entities: [
            ...existingAffiliations.map(entity => ({ ...entity, state: 'ACTIVE' })),
            ...(affiliated
              ? [{ identifier, legalName: name, legalType, state: 'ACTIVE', businessNumber: '123456789' }]
              : [])
          ]
        }
      })
    }
  })

  // Affiliation invitations create + list. Stateful like the affiliations mock: after the
  // email option POSTs an invitation, GETs return it as pending. `entity` is null on
  // purpose - auth-api enriches the entity from LEAR, so a COLIN business comes back
  // null (or, after the auth-api fallback, with auth-local data); the table must
  // survive the null shape.
  let emailInvitePending = false
  await page.route('**/affiliationInvitations**', async (route) => {
    if (route.request().method() === 'POST') {
      handles.callOrder.push('create-invitation')
      emailInvitePending = true
      await route.fulfill({ status: 201, json: { id: 99, type: 'EMAIL', status: 'PENDING' } })
    } else {
      handles.callOrder.push('invitations')
      await route.fulfill({
        json: {
          affiliationInvitations: emailInvitePending
            ? [{
                id: 99,
                type: 'EMAIL',
                status: 'PENDING',
                businessIdentifier: identifier,
                entity: null,
                fromOrg: { id: 123, name: 'Test Account' },
                toOrg: null,
                recipientEmail: contactsEmail
              }]
            : []
        }
      })
    }
  })

  // Membership check (dashboard.vue onMounted -> validateAccountStatus) - keep this a
  // clean admin/active account so no competing "account setup incomplete" modal opens.
  await page.route('**/users/orgs/**/membership', async (route) => {
    await route.fulfill({
      json: {
        id: 1,
        membershipTypeCode: 'ADMIN',
        membershipStatus: 'ACTIVE',
        user: { id: 1, username: 'testuser', firstname: 'Test', lastname: 'User' }
      }
    })
  })

  // Business API authorized actions (affiliations.loadAuthorizedActions -> IsAuthorized()).
  // Deliberately excludes ADD_ENTITY_NO_AUTHENTICATION so that the manage-business modal flow is entered
  await page.route('**/permissions', async (route) => {
    await route.fulfill({ json: { authorizedPermissions: defaultAccountAuthorizedActions } })
  })

  // regSearch (search-api.ts) - stands in for the user picking this business from the
  // BusinessLookup combobox; the `?populate=` query param drives the same code path.
  await page.route('**/businesses/search/facets**', async (route) => {
    handles.callOrder.push('regSearch')
    await route.fulfill({
      json: {
        searchResults: {
          queryInfo: { query: {}, categories: {} },
          totalResults: 1,
          results: [{ name, identifier, bn: '123456789', status: 'ACTIVE', legalType, modernized }]
        }
      }
    })
  })

  // affiliations.syncBusinessFromColin()
  await page.route(`**/entities/${identifier}/synchronizations/colin`, async (route) => {
    handles.callOrder.push('sync-from-colin')
    await route.fulfill({ status: syncStatus, json: syncStatus < 300 ? {} : { message: 'Not Found' } })
  })

  // ManageBusiness.vue onMounted - contacts
  await page.route(`**/entities/${identifier}/contacts`, async (route) => {
    handles.callOrder.push('contacts')
    if (contactsStatus < 300) {
      await route.fulfill({ status: contactsStatus, json: { email: contactsEmail } })
    } else {
      await route.fulfill({ status: contactsStatus, json: { message: 'Not Found' } })
    }
  })

  // ManageBusiness.vue onMounted - affiliated accounts (delegation option source)
  await page.route(`**/orgs/affiliation/${identifier}`, async (route) => {
    handles.callOrder.push('orgs-affiliation')
    await route.fulfill({ status: orgsAffiliationStatus, json: { orgsDetails } })
  })

  // ManageBusiness.vue onMounted - business passcode/authentication
  await page.route(`**/entities/${identifier}/authentication`, async (route) => {
    handles.callOrder.push('authentication')
    if (authenticationStatus < 300) {
      await route.fulfill({
        status: authenticationStatus,
        json: { contactEmail: contactsEmail, hasValidPassCode }
      })
    } else {
      await route.fulfill({ status: authenticationStatus, json: { message: 'Not Found' } })
    }
  })

  // ManageBusiness.vue onMounted - checkBusinessExistsInLear()
  await page.route(`**/businesses/${identifier}?slim=true`, async (route) => {
    handles.callOrder.push('businesses-slim')
    if (isLearBusiness) {
      await route.fulfill({ status: 200, json: { business: { identifier, legalType } } })
    } else {
      await route.fulfill({ status: 404, json: { message: 'Not Found' } })
    }
  })

  return handles
}

/**
 * Drives affiliations.handleManageBusinessOrNameRequest('reg', ...) via the
 * `?populate=` query param shortcut instead of typing into the BusinessLookup combobox.
 */
export async function triggerManageBusiness (page: Page, identifier: string = 'BC0870226') {
  await page.goto(`/en-CA?populate=${identifier}`)
}
