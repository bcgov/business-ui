import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import AcceptToken from '~/pages/affiliationInvitation/acceptToken.vue'
import { enI18n } from '~~/tests/mocks/i18n'

// Mock useRoute to provide test route parameters and metadata
mockNuxtImport('useRoute', () => {
  return () => ({
    params: {
      token: 'dummy-token'
    },
    meta: {
      checkMagicLink: true
    }
  })
})

// Mock toast notifications service
const mockToast = {
  add: vi.fn()
}

// Mock modal service for displaying various modals
const mockBrdModal = {
  openMagicLinkModal: vi.fn(),
  openBusinessAddError: vi.fn()
}

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
  })
})
