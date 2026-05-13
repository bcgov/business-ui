import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { HelpTextSection } from '#components'
import { enI18n } from '~~/tests/mocks/i18n'
import DashboardLayout from '~/layouts/dashboard.vue'

// Mutable state object — updated in beforeEach and individual tests.
// Using a single object so the mockNuxtImport factory closures always read the latest values.
const mockState = vi.hoisted(() => ({
  isAuthenticated: true,
  currentAccountId: 123,
  currentAccountStatus: 'ACTIVE',
  orgIdParam: undefined as string | undefined,
  isAuthorizedResult: false,
  userAccounts: [] as Array<{ id: number }>
}))

const mockFns = vi.hoisted(() => ({
  validateAccountStatus: vi.fn(),
  navigateTo: vi.fn(),
  setBreadcrumbs: vi.fn(),
  openNoSubscriptionModal: vi.fn()
}))

// --- Mock: useKeycloak ---
mockNuxtImport('useKeycloak', () => {
  return () => ({
    isAuthenticated: { value: mockState.isAuthenticated }
  })
})

// --- Mock: useConnectAccountStore ---
mockNuxtImport('useConnectAccountStore', () => {
  return () => ({
    get currentAccount () {
      return {
        id: mockState.currentAccountId,
        accountStatus: mockState.currentAccountStatus
      }
    },
    set currentAccount (_val: unknown) {},
    get userAccounts () { return mockState.userAccounts }
  })
})

// --- Mock: useRoute ---
mockNuxtImport('useRoute', () => {
  return () => ({
    get params () {
      return { orgId: mockState.orgIdParam }
    }
  })
})

// --- Mock: IsAuthorized (auto-imported utility) ---
mockNuxtImport('IsAuthorized', () => {
  return (_action: unknown) => mockState.isAuthorizedResult
})

// --- Mock: useAccountValidation ---
mockNuxtImport('useAccountValidation', () => {
  return () => ({
    validateAccountStatus: mockFns.validateAccountStatus
  })
})

// --- Mock: useBrdModals ---
mockNuxtImport('useBrdModals', () => {
  return () => ({
    openNoSubscriptionModal: mockFns.openNoSubscriptionModal
  })
})

// --- Mock: navigateTo ---
mockNuxtImport('navigateTo', () => mockFns.navigateTo)

// --- Mock: setBreadcrumbs ---
mockNuxtImport('setBreadcrumbs', () => mockFns.setBreadcrumbs)

describe('Dashboard Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockState.isAuthenticated = true
    mockState.currentAccountId = 123
    mockState.currentAccountStatus = 'ACTIVE'
    mockState.orgIdParam = undefined
    mockState.isAuthorizedResult = false
    mockState.userAccounts = []
    // Reset window.location for each test
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: 'http://localhost/' }
    })
  })

  function mountComponent () {
    return mountSuspended(DashboardLayout, {
      global: { plugins: [enI18n] }
    })
  }

  it('should mount successfully', async () => {
    const wrapper = await mountComponent()
    expect(wrapper.exists()).toBe(true)
  })

  it('renders help text section', async () => {
    const wrapper = await mountComponent()
    expect(wrapper.findComponent(HelpTextSection).exists()).toBe(true)
  })

  describe('showStaffText', () => {
    it('shows regular h1 when user is not authorized for staff dashboard', async () => {
      mockState.isAuthorizedResult = false
      const wrapper = await mountComponent()
      expect(wrapper.find('h1').text()).toBe(enI18n.global.t('page.home.h1'))
    })

    it('shows staff h1 when user is authorized and no orgId param', async () => {
      mockState.isAuthorizedResult = true
      mockState.orgIdParam = undefined
      const wrapper = await mountComponent()
      expect(wrapper.find('h1').text()).toBe(enI18n.global.t('page.home.h1Staff'))
    })

    it('shows staff h1 when authorized and orgId matches current account', async () => {
      mockState.isAuthorizedResult = true
      mockState.currentAccountId = 456
      mockState.orgIdParam = '456'
      const wrapper = await mountComponent()
      expect(wrapper.find('h1').text()).toBe(enI18n.global.t('page.home.h1Staff'))
    })

    it('shows regular h1 when authorized but orgId does not match current account', async () => {
      mockState.isAuthorizedResult = true
      mockState.currentAccountId = 456
      mockState.orgIdParam = '999'
      const wrapper = await mountComponent()
      expect(wrapper.find('h1').text()).toBe(enI18n.global.t('page.home.h1'))
    })
  })

  describe('intro text', () => {
    it('renders the intro paragraph', async () => {
      const wrapper = await mountComponent()
      const intro = wrapper.find('p')
      expect(intro.exists()).toBe(true)
      expect(intro.text()).toBe(enI18n.global.t('page.home.intro'))
    })
  })

  describe('onMounted — authentication redirect', () => {
    it('redirects unauthenticated users to login', async () => {
      mockState.isAuthenticated = false
      await mountComponent()
      expect(window.location.href).toContain('/login/')
      expect(window.location.href).toContain('return=')
    })

    it('does not call validateAccountStatus when unauthenticated', async () => {
      mockState.isAuthenticated = false
      await mountComponent()
      expect(mockFns.validateAccountStatus).not.toHaveBeenCalled()
    })
  })

  describe('onMounted — inactive account redirect', () => {
    it('redirects to account settings when account is not ACTIVE', async () => {
      mockState.currentAccountId = 789
      mockState.currentAccountStatus = 'PENDING_ACTIVATION'
      await mountComponent()
      expect(window.location.href).toContain('/account/789/settings/account-info')
    })

    it('does not call validateAccountStatus when account is inactive', async () => {
      mockState.currentAccountId = 789
      mockState.currentAccountStatus = 'PENDING_ACTIVATION'
      await mountComponent()
      expect(mockFns.validateAccountStatus).not.toHaveBeenCalled()
    })
  })

  describe('onMounted — validateAccountStatus', () => {
    it('calls validateAccountStatus for authenticated active accounts', async () => {
      await mountComponent()
      expect(mockFns.validateAccountStatus).toHaveBeenCalledOnce()
    })
  })

  describe('breadcrumbs', () => {
    it('sets regular breadcrumbs when not staff authorized', async () => {
      mockState.isAuthorizedResult = false
      mockState.currentAccountId = 123
      await mountComponent()
      expect(mockFns.setBreadcrumbs).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ label: enI18n.global.t('labels.bcRegDashboard') }),
          expect.objectContaining({ label: enI18n.global.t('page.home.h1') })
        ])
      )
    })

    it('sets staff breadcrumbs when staff authorized', async () => {
      mockState.isAuthorizedResult = true
      mockState.orgIdParam = undefined
      await mountComponent()
      expect(mockFns.setBreadcrumbs).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ label: enI18n.global.t('labels.bcRegStaffDashboard') }),
          expect.objectContaining({ label: enI18n.global.t('page.home.h1Staff') })
        ])
      )
    })
  })

  describe('watch orgId param — account switching', () => {
    it('switches currentAccount when orgId matches a user account', async () => {
      mockState.userAccounts = [{ id: 123 }, { id: 555 }]
      mockState.orgIdParam = '555'
      // watch runs immediately (immediate: true), mounting is sufficient to trigger it
      const wrapper = await mountComponent()
      expect(wrapper.exists()).toBe(true)
    })

    it('does not switch account when orgId is not in userAccounts', async () => {
      mockState.userAccounts = [{ id: 123 }]
      mockState.orgIdParam = '999'
      const wrapper = await mountComponent()
      expect(wrapper.exists()).toBe(true)
    })
  })
})
