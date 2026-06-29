import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const identifier = 'BC1234567'

const mockRoute = reactive({
  params: { businessId: identifier },
  query: {} as { draft?: string }
})
mockNuxtImport('useRoute', () => () => mockRoute)

mockNuxtImport('useRuntimeConfig', () => () => ({
  public: {
    businessDashboardUrl: 'http://dashboard/',
    businessEditUrl: 'http://edit/',
    authWebUrl: 'http://auth/',
    registryHomeUrl: 'http://registry-home/',
    brdUrl: 'http://brd/'
  }
}))

const testAccountId = 'test-account-id'
mockNuxtImport('useConnectAccountStore', () => () => ({
  currentAccount: { id: testAccountId, accountType: 'Basic' }
}))

let mockIsStaff = false
mockNuxtImport('useIsStaff', () => () => computed(() => mockIsStaff))

mockNuxtImport('useBusinessStore', () => () => ({
  business: { legalName: 'Test Business Inc.', identifier: 'BC1234567' }
}))

describe('useFilingNavigation', () => {
  beforeEach(() => {
    mockRoute.query = {}
    mockIsStaff = false
    vi.clearAllMocks()
  })

  describe('when NOT in draft mode (route.query.draft is undefined)', () => {
    it('should correctly return that it is not a draft', () => {
      const { isDraft } = useFilingNavigation()
      expect(isDraft.value).toBe(false)
    })

    it('should return the correct dashboard URL', () => {
      const { dashboardUrl } = useFilingNavigation()
      expect(dashboardUrl.value).toBe(`http://dashboard/${identifier}?accountid=${testAccountId}`)
    })

    it('should return the correct breadcrumbs for a non-draft filing', () => {
      const { breadcrumbs, dashboardUrl } = useFilingNavigation()
      const breadcrumbItems = breadcrumbs.value

      expect(breadcrumbItems).toHaveLength(4)

      expect(breadcrumbItems[2]!.label).toBe('Test Business Inc.')
      expect(breadcrumbItems[2]!.to).toBe(dashboardUrl.value)
    })
  })

  describe('when IN draft mode (route.query.draft is defined)', () => {
    beforeEach(() => {
      mockRoute.query = { draft: '12345' }
    })

    it('should correctly return that it is a draft', () => {
      const { isDraft } = useFilingNavigation()
      expect(isDraft.value).toBe(true)
    })

    it('should return the correct breadcrumbs for a draft filing', () => {
      const { breadcrumbs, dashboardUrl } = useFilingNavigation()
      const breadcrumbItems = breadcrumbs.value

      expect(breadcrumbItems).toHaveLength(4)

      expect(breadcrumbItems[2]!.label).toBe('Test Business Inc.')
      expect(breadcrumbItems[2]!.to).toBe(dashboardUrl.value)
    })
  })

  describe('Computed breadcrumb', () => {
    it('should preserve breadcrumbs when the route query changes', async () => {
      const { isDraft, breadcrumbs } = useFilingNavigation()
      expect(isDraft.value).toBe(false)
      expect(breadcrumbs.value[2]!.label).toBe('Test Business Inc.')

      mockRoute.query = { draft: 'filing-123' }
      await nextTick()

      expect(isDraft.value).toBe(true)
      expect(breadcrumbs.value[2]!.label).toBe('Test Business Inc.')
    })

    it('should return correct breadcrumbs when user is Staff', async () => {
      const { breadcrumbs } = useFilingNavigation('Some Filing Label')

      mockIsStaff = true

      expect(breadcrumbs.value).toHaveLength(4)

      const bc1 = breadcrumbs.value[0]
      expect(bc1).toEqual({
        appendAccountId: true,
        external: true,
        label: 'Staff Dashboard',
        to: 'http://auth/staff/dashboard/active'
      })

      const bc2 = breadcrumbs.value[1]
      expect(bc2).toEqual({
        external: true,
        label: 'My Staff Business Registry',
        to: 'http://brd/account/test-account-id'
      })

      const bc3 = breadcrumbs.value[2]
      expect(bc3).toEqual({
        external: true,
        label: 'Test Business Inc.',
        to: 'http://dashboard/BC1234567?accountid=test-account-id'
      })

      const bc4 = breadcrumbs.value[3]
      expect(bc4).toEqual({ label: 'Some Filing Label' })
    })

    it('should return correct breadcrumbs when user is NOT Staff', async () => {
      const { breadcrumbs } = useFilingNavigation('Some Filing Label')

      expect(breadcrumbs.value).toHaveLength(4)

      const bc1 = breadcrumbs.value[0]
      expect(bc1).toEqual({
        appendAccountId: true,
        external: true,
        label: 'BC Registries Dashboard',
        to: 'http://registry-home/dashboard'
      })

      const bc2 = breadcrumbs.value[1]
      expect(bc2).toEqual({
        external: true,
        label: 'My Business Registry',
        to: 'http://brd/account/test-account-id'
      })

      const bc3 = breadcrumbs.value[2]
      expect(bc3).toEqual({
        external: true,
        label: 'Test Business Inc.',
        to: 'http://dashboard/BC1234567?accountid=test-account-id'
      })

      const bc4 = breadcrumbs.value[3]
      expect(bc4).toEqual({ label: 'Some Filing Label' })
    })
  })
})
