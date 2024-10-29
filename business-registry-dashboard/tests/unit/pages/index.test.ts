import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { DashboardLayout } from '#components'
import Index from '~/pages/index.vue'
import { enI18n } from '~~/tests/mocks/i18n'

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

  it('should render DashboardLayout component', async () => {
    const wrapper = await mountPage()
    expect(wrapper.findComponent(DashboardLayout).exists()).toBe(true)
  })
})
