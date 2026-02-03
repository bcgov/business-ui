import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { describe, it, expect } from 'vitest'
import { FormPreExistingCompanyProvisions } from '#components'

mockNuxtImport('useRuntimeConfig', () => () => ({
  public: {
    preExistingCompanyProvisions: 'https://www.corp-act-link.example.com'
  }
}))

describe('FormPreExistingCompanyProvisions', () => {
  it('matches the snapshot with an order prop', async () => {
    const wrapper = await mountSuspended(FormPreExistingCompanyProvisions, {
      props: { order: 5 }
    })

    expect(wrapper.element).toMatchSnapshot()
  })

  it('matches the snapshot without an order prop', async () => {
    const wrapper = await mountSuspended(FormPreExistingCompanyProvisions)
    expect(wrapper.element).toMatchSnapshot()
  })
})
