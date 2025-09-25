import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const identifier = 'BC1234567'
const testAccountId = 'test-account-id'

const mockRoute = reactive({
  params: { businessId: identifier },
  query: {} as { draft?: string }
})
mockNuxtImport('useRoute', () => () => mockRoute)

mockNuxtImport('useRuntimeConfig', () => () => ({
  public: {
    businessDashboardUrl: 'http://dashboard/',
    businessEditUrl: 'http://edit/'
  }
}))

mockNuxtImport('useConnectAccountStore', () => () => ({
  currentAccount: { id: testAccountId }
}))

mockNuxtImport('useOfficerStore', () => () => ({
  activeBusiness: { legalName: 'Test Business Inc.' }
}))

describe('useOfficerNavigation', () => {
  beforeEach(() => {
    mockRoute.query = {}
    vi.clearAllMocks()
  })

  describe('when NOT in draft mode (route.query.draft is undefined)', () => {
    it('should correctly return that it is not a draft', () => {
      const { isDraft } = useOfficerNavigation()
      expect(isDraft.value).toBe(false)
    })

    it('should return the correct dashboard and edit URLs', () => {
      const { dashboardUrl, editUrl } = useOfficerNavigation()
      expect(dashboardUrl.value).toBe(`http://dashboard/${identifier}?accountid=${testAccountId}`)
      expect(editUrl.value).toBe(`http://edit/${identifier}/alteration?accountid=${testAccountId}`)
    })

    it('dashboardOrEditUrl should return the edit URL', () => {
      const { dashboardOrEditUrl, editUrl } = useOfficerNavigation()
      expect(dashboardOrEditUrl.value).toBe(editUrl.value)
    })

    it('should return the correct breadcrumbs for a non-draft filing', () => {
      const { breadcrumbs, editUrl, dashboardUrl } = useOfficerNavigation()
      const breadcrumbItems = breadcrumbs.value

      expect(breadcrumbItems).toHaveLength(5)

      expect(breadcrumbItems[2]!.label).toBe('Test Business Inc.')
      expect(breadcrumbItems[2]!.to).toBe(dashboardUrl.value)
      expect(breadcrumbItems[3]!.label).toBe('Company Information Page')
      expect(breadcrumbItems[3]!.to).toBe(editUrl.value)
    })
  })

  describe('when IN draft mode (route.query.draft is defined)', () => {
    beforeEach(() => {
      mockRoute.query = { draft: '12345' }
    })

    it('should correctly return that it is a draft', () => {
      const { isDraft } = useOfficerNavigation()
      expect(isDraft.value).toBe(true)
    })

    it('dashboardOrEditUrl should return the dashboard URL', () => {
      const { dashboardOrEditUrl, dashboardUrl } = useOfficerNavigation()
      expect(dashboardOrEditUrl.value).toBe(dashboardUrl.value)
    })

    it('should return the correct breadcrumbs for a draft filing', () => {
      const { breadcrumbs, dashboardUrl } = useOfficerNavigation()
      const breadcrumbItems = breadcrumbs.value

      expect(breadcrumbItems).toHaveLength(4)

      expect(breadcrumbItems[2]!.label).toBe('Test Business Inc.')
      expect(breadcrumbItems[2]!.to).toBe(dashboardUrl.value)
    })
  })

  describe('Computeds', () => {
    it('should update URLs and breadcrumbs when the route query changes', async () => {
      const { isDraft, dashboardOrEditUrl, dashboardUrl, breadcrumbs, editUrl } = useOfficerNavigation()
      expect(isDraft.value).toBe(false)
      expect(dashboardOrEditUrl.value).toBe(editUrl.value)
      expect(breadcrumbs.value[2]!.label).toBe('Test Business Inc.')
      expect(breadcrumbs.value[2]!.to).toBe(dashboardUrl.value)
      expect(breadcrumbs.value[3]!.label).toBe('Company Information Page')
      expect(breadcrumbs.value[3]!.to).toBe(editUrl.value)
      expect(breadcrumbs.value).toHaveLength(5)

      mockRoute.query = { draft: 'filing-123' }
      await nextTick()

      expect(isDraft.value).toBe(true)
      expect(dashboardOrEditUrl.value).not.toBe(editUrl.value)
      expect(breadcrumbs.value[2]!.label).toBe('Test Business Inc.')
      expect(breadcrumbs.value).toHaveLength(4)
    })
  })
})
