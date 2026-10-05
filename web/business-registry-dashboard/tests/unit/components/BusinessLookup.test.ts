import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { VueWrapper, flushPromises } from '@vue/test-utils'
import { BusinessLookup } from '#components'
import { enI18n } from '~~/tests/mocks/i18n'

const mockAffStore = reactive({
  affiliations: { results: [] as any[] },
  affiliatedIdentifiers: [] as any[],
  loadAffiliatedIdentifiers: vi.fn(),
  handleManageBusinessOrNameRequest: vi.fn()
})
mockNuxtImport('useAffiliationsStore', () => {
  return () => mockAffStore
})

const mockRegSearch = vi.fn()

function waitForDebounce (timeout = 500) {
  return new Promise<void>(resolve => setTimeout(resolve, timeout))
}

describe('<BusinessLookup />', () => {
  let wrapper: VueWrapper
  let regSearch: any

  beforeEach(() => {
    regSearch = useNuxtApp().$searchAPI.regSearch
    useNuxtApp().$searchAPI.regSearch = mockRegSearch
    mockAffStore.affiliations.results = [{ businessIdentifier: 'BC0000001' }]
    mockAffStore.affiliatedIdentifiers = []
    mockRegSearch.mockResolvedValue([
      { identifier: 'BC0000001', name: 'On Current Page' },
      { identifier: 'BC0000002', name: 'On Another Page' },
      { identifier: 'BC0000003', name: 'Not Affiliated' }
    ])
    // the identifiers are only loaded once a search is made
    mockAffStore.loadAffiliatedIdentifiers.mockImplementation(() => {
      mockAffStore.affiliatedIdentifiers = [{ businessIdentifier: 'BC0000001' }, { businessIdentifier: 'BC0000002' }]
      return Promise.resolve()
    })
  })

  afterEach(() => {
    useNuxtApp().$searchAPI.regSearch = regSearch
    vi.resetAllMocks()
    wrapper.unmount()
  })

  it('flags affiliated businesses that are not in the loaded affiliations as added', async () => {
    wrapper = await mountSuspended(BusinessLookup, { global: { plugins: [enI18n] } })

    await wrapper.find('input').setValue('BC000000')
    await flushPromises()
    await waitForDebounce()
    await flushPromises()

    expect(mockRegSearch).toHaveBeenCalledWith('BC000000')
    expect(mockAffStore.loadAffiliatedIdentifiers).toHaveBeenCalledOnce()

    const items = wrapper.findAll('li')
    expect(items.length).toBe(3)
    expect(items[0]!.text()).toContain('Added')
    expect(items[1]!.text()).toContain('Added')
    expect(items[2]!.text()).not.toContain('Added')
    expect(items[2]!.text()).toContain('Select')
  })
})
