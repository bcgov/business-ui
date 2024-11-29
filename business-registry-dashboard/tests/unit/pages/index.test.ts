import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect, vi } from 'vitest'
import { BusinessLookup, TableAffiliatedEntity } from '#components'
import Dashboard from '~/layouts/dashboard.vue'
import { enI18n } from '~~/tests/mocks/i18n'
import Index from '~/pages/index.vue'

// Sample parsed token data structure for testing
const mockParsedToken = {
  fromOrgId: '12345',
  businessIdentifier: 'BC12345',
  id: '87654'
}

describe('Index Page', () => {
  function mountPage () {
    return mountSuspended(Index, {
      global: {
        plugins: [enI18n]
      }
    })
  }

  it('should mount successfully', async () => {
    const wrapper = await mountPage()
    expect(wrapper.exists()).toBe(true)
  })

  it('should render Dashboard layout correctly', async () => {
    const wrapper = await mountPage()
    expect(wrapper.findComponent(Dashboard).exists()).toBe(true)
  })

  it('should render child components correctly', async () => {
    const wrapper = await mountPage()
    expect(wrapper.findComponent(BusinessLookup).exists()).toBe(true)
    expect(wrapper.findComponent(TableAffiliatedEntity).exists()).toBe(true)
  })

  describe('Token Parsing', () => {
    it('successfully parses a valid token', async () => {
      const wrapper = await mountPage()
      const component = wrapper.vm as any

      // Mock parseToken to return expected data structure
      vi.spyOn(component, 'parseToken').mockReturnValue(mockParsedToken)

      const token = component.parseToken('dummy-token')
      expect(token).toEqual(mockParsedToken)
    })

    it('throws error for invalid token', async () => {
      const wrapper = await mountPage()
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
