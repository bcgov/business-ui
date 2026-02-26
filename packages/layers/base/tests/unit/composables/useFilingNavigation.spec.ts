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

mockNuxtImport('useBusinessStore', () => () => ({
  business: { legalName: 'Test Business Inc.', identifier: 'BC1234567' }
}))

describe('useFilingNavigation', () => {
  beforeEach(() => {
    mockRoute.query = {}
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

      expect(breadcrumbItems[2]!.label).toBe('Company Information Page')
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

  describe('Computeds', () => {
    it('should update breadcrumbs when the route query changes', async () => {
      const { isDraft, breadcrumbs } = useFilingNavigation()
      expect(isDraft.value).toBe(false)
      expect(breadcrumbs.value[2]!.label).toBe('Company Information Page')

      mockRoute.query = { draft: 'filing-123' }
      await nextTick()

      expect(isDraft.value).toBe(true)
      expect(breadcrumbs.value[2]!.label).toBe('Test Business Inc.')
    })
  })
})
