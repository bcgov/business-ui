import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect } from 'vitest'
import { BusinessLookup, TableAffiliatedEntity } from '#components'
import Dashboard from '~/layouts/dashboard.vue'
import { enI18n } from '~~/tests/mocks/i18n'
import Index from '~/pages/index.vue'

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
})
