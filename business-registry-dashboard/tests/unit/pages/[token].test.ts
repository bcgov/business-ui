import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AcceptToken from '~/pages/[encodedOrgId]/affiliationInvitation/acceptToken/[token].vue'
import { enI18n } from '~~/tests/mocks/i18n'

const mockToast = {
  add: vi.fn()
}

const mockBrdModal = {
  openMagicLinkModal: vi.fn(),
  openBusinessAddError: vi.fn()
}

// Mock route
const mockRoute = {
  params: {
    token: 'eyJmcm9tT3JnSWQiOiIxMjM0NSIsImJ1c2luZXNzSWRlbnRpZmllciI6IkJDMTIzNDUiLCJpZCI6Ijg3NjU0In0=.signature'
  },
  meta: {
    checkMagicLink: true
  }
}

describe('AcceptToken Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mountComponent = () => {
    return mount(AcceptToken, {
      global: {
        plugins: [enI18n],
        mocks: {
          $route: mockRoute,
          $toast: mockToast,
          $brdModal: mockBrdModal
        }
      }
    })
  }

  describe('Token Parsing', () => {
    it('successfully parses a valid token', () => {
      const wrapper = mountComponent()
      const component = wrapper.vm as any

      const token = component.parseToken(mockRoute.params.token)
      expect(token).toEqual({
        fromOrgId: '12345',
        businessIdentifier: 'BC12345',
        id: '87654'
      })
    })

    it('throws error for invalid token', () => {
      const wrapper = mountComponent()
      const component = wrapper.vm as any

      expect(() => component.parseToken('invalid-token'))
        .toThrow('Invalid token format')
    })
  })
})
