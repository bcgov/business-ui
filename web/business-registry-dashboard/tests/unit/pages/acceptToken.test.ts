import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import AcceptToken from '~/pages/affiliationInvitation/acceptToken.vue'
import { enI18n } from '~~/tests/mocks/i18n'

const COMPRESSED_TOKEN = '.eJyrVspMUbKyMDHTUUorys_1L0r3BPLzSnNydJRK8lG4SaXFmXmpxcWeKal5JZlpmalFSlZKTs4GFhYWRuYmSrUApKwYSA.aYyj4Q.ZO59NCoNhHR6rHHSEL_-OdTdrQc'
const UNCOMPRESSED_TOKEN = 'eyJpZCI6OCwiZnJvbU9yZ0lkIjoyNTIzLCJ0b09yZ0lkIjoyOTk0LCJidXNpbmVzc0lkZW50aWZpZXIiOiJCQzA4NzEzMzAifQ.ZNPNWg.lrG2RAy9EOXQshT9cMzf1xyEE04'

// Mock useRoute to provide test route parameters and metadata
let mockToken: string | undefined
mockNuxtImport('useRoute', () => {
  return () => ({
    params: {
      token: 'dummy-token'
    },
    query: {
      token: mockToken
    },
    meta: {
      checkMagicLink: true
    }
  })
})

const mockSwitchAccount = vi.fn()
mockNuxtImport('useConnectAccountStore', () => () => ({
  switchCurrentAccount: mockSwitchAccount,
  currentAccount: { id: 1234 },
  userAccounts: [
    { id: 1234 }, { id: 5678 }, { id: 9012 }
  ]
}))

const mockAuthApi = vi.fn()
const mockBusinessApi = vi.fn()
mockNuxtImport('useNuxtApp', () => {
  return () => ({
    $authApi: mockAuthApi,
    $businessApi: mockBusinessApi,
    $i18n: {
      t: (key: string) => key
    },
    payload: {
      state: {}
    }
  })
})

mockNuxtImport('useModal', () => () => ({ open: vi.fn() }))

const { mockAcceptInvitation } = vi.hoisted(() => ({ mockAcceptInvitation: vi.fn() }))
vi.mock('~/services/affiliation-invitation-service', () => {
  return {
    default: {
      acceptInvitation: mockAcceptInvitation
    }
  }
})

// Mock toast notifications service
const mockToast = {
  add: vi.fn()
}

// Mock modal service for displaying various modals
const mockBrdModal = {
  openMagicLinkModal: vi.fn(),
  openBusinessAddError: vi.fn(),
  openManageBusiness: vi.fn()
}

mockNuxtImport('useBrdModals', () => () => mockBrdModal)

// Sample parsed token data structure for testing
const mockParsedToken = {
  fromOrgId: '12345',
  businessIdentifier: 'BC12345',
  id: '87654'
}

describe('AcceptToken Page', () => {
  // Clear all mock function calls before each test
  beforeEach(() => {
    vi.clearAllMocks()
    mockToken = undefined
  })

  // Helper function to mount component with necessary global plugins and mocks
  const mountComponent = () => {
    return mount(AcceptToken, {
      global: {
        plugins: [enI18n],
        mocks: {
          $toast: mockToast,
          $brdModal: mockBrdModal
        },
        stubs: {
          NuxtLayout: true // Stub out NuxtLayout component
        }
      }
    })
  }

  describe('Token Parsing', () => {
    it('successfully parses a valid token', () => {
      const wrapper = mountComponent()
      const component = wrapper.vm as any

      // Mock parseToken to return expected data structure
      vi.spyOn(component, 'parseToken').mockReturnValue(mockParsedToken)

      const token = component.parseToken('dummy-token')
      expect(token).toEqual(mockParsedToken)
    })

    it('throws error for invalid token', () => {
      const wrapper = mountComponent()
      const component = wrapper.vm as any

      // Mock parseToken to simulate parsing failure
      vi.spyOn(component, 'parseToken').mockImplementation(() => {
        throw new Error('Invalid token format')
      })

      expect(() => component.parseToken('invalid-token'))
        .toThrow('Invalid token format')
    })

    it('should switch account if fromOrgId is in token', () => {
      const fromOrgId = 9012
      mockToken = btoa(JSON.stringify({ ...mockParsedToken, fromOrgId }))

      mountComponent()
      expect(mockSwitchAccount).toHaveBeenCalledWith(fromOrgId)
    })

    it('should not switch account if fromOrgId is null', () => {
      mockToken = btoa(JSON.stringify({ ...mockParsedToken, fromOrgId: null }))

      mountComponent()
      expect(mockSwitchAccount).not.toHaveBeenCalled()
    })
  })

  it('successfully parses both compressed and uncompressed tokens', () => {
    const wrapper = mountComponent()
    const component = wrapper.vm as any

    // Compressed token
    const compressedToken = component.parseToken(COMPRESSED_TOKEN)
    expect(compressedToken.businessIdentifier).toBeDefined()
    expect(compressedToken.id).toBeDefined()

    const uncompressedToken = component.parseToken(UNCOMPRESSED_TOKEN)
    expect(uncompressedToken.businessIdentifier).toBeDefined()
    expect(uncompressedToken.id).toBeDefined()
  })

  describe('SAF Affiliation Error Handling', () => {
    const identifier = 'BC1234567'

    beforeEach(() => {
      vi.clearAllMocks()
      mockBusinessApi.mockResolvedValue({
        business: { legalType: 'BC', legalName: 'Testing Inc', state: 'ACTIVE' }
      })

      mockAuthApi.mockResolvedValue({ entities: [] })
    })

    const initMocks = (component: any, invitationError: object) => {
      vi.spyOn(component, 'parseToken').mockReturnValue({
        fromOrgId: null,
        businessIdentifier: identifier,
        id: '87654'
      })

      mockAcceptInvitation.mockRejectedValue(invitationError)
    }

    it('opens Manage Business modal with "expired" alert when link is expired', async () => {
      const wrapper = mountComponent()
      const component = wrapper.vm as any

      const expiredError = {
        response: {
          status: 400,
          _data: { code: 'EXPIRED_AFFILIATION_INVITATION' }
        }
      }

      initMocks(component, expiredError)

      await component.parseUrlAndAddAffiliation({ businessIdentifier: identifier, id: '1', fromOrgId: null }, 'token')

      expect(mockAcceptInvitation).toHaveBeenCalled()

      expect(mockBrdModal.openManageBusiness).toHaveBeenCalledWith(
        expect.objectContaining({ identifier }),
        expect.objectContaining({ translationPath: 'form.manageBusiness.safAffiliationAlert.expired' }),
        true
      )
    })

    it('checks affiliations and shows "already added" modal if business is in account', async () => {
      const wrapper = mountComponent()
      const component = wrapper.vm as any

      const actionedError = {
        response: {
          status: 400,
          _data: { code: 'ACTIONED_AFFILIATION_INVITATION' }
        }
      }

      initMocks(component, actionedError)

      // mock already added to account
      mockAuthApi.mockResolvedValue({
        entities: [{ identifier, name: 'Testing Inc' }]
      })

      await component.parseUrlAndAddAffiliation({ businessIdentifier: identifier, id: '1', fromOrgId: null }, 'token')

      expect(mockAcceptInvitation).toHaveBeenCalled()

      expect(mockBrdModal.openMagicLinkModal).toHaveBeenCalledWith(
        'error.magicLinkAlreadyAdded.title',
        'error.magicLinkAlreadyAdded.description'
      )
      expect(mockBrdModal.openManageBusiness).not.toHaveBeenCalled()
    })

    it('opens Manage Business modal with "actioned" alert if business is NOT in account', async () => {
      const wrapper = mountComponent()
      const component = wrapper.vm as any

      const actionedError = {
        response: {
          status: 400,
          _data: { code: 'ACTIONED_AFFILIATION_INVITATION' }
        }
      }

      initMocks(component, actionedError)

      // invitation ACCEPTED but not in orgs affiliations
      mockAuthApi.mockResolvedValue({ entities: [] })

      await component.parseUrlAndAddAffiliation({ businessIdentifier: identifier, id: '1', fromOrgId: null }, 'token')

      expect(mockAcceptInvitation).toHaveBeenCalled()

      expect(mockBrdModal.openManageBusiness).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ translationPath: 'form.manageBusiness.safAffiliationAlert.actioned' }),
        true
      )
    })

    it('opens Manage Business modal with "generic" alert for unknown SAF errors', async () => {
      const wrapper = mountComponent()
      const component = wrapper.vm as any

      const unknownError = {
        response: {
          status: 400,
          _data: { code: 'UNKNOWN_ERROR_CODE' }
        }
      }

      initMocks(component, unknownError)

      await component.parseUrlAndAddAffiliation({ businessIdentifier: identifier, id: '1', fromOrgId: null }, 'token')

      expect(mockAcceptInvitation).toHaveBeenCalled()

      expect(mockBrdModal.openManageBusiness).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          translationPath: 'form.manageBusiness.safAffiliationAlert.generic'
        }),
        true
      )
    })
  })
})
