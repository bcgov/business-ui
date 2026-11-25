import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import AddBusinessSuccess from '~/components/Modal/AddBusinessSuccess.vue'

const mockBusinessApi = vi.fn()
mockNuxtImport('useNuxtApp', () => () => ({
  $businessApi: mockBusinessApi,
  $i18n: { t: (key: string) => key }
}))

let mockFlag: string | undefined
mockNuxtImport('useConnectLaunchdarklyStore', () => () => ({ getStoredFlag: () => mockFlag }))
mockNuxtImport('useBrdModals', () => () => ({ close: vi.fn() }))
mockNuxtImport('useAffiliationsStore', () => () => ({ loadAffiliations: vi.fn() }))
mockNuxtImport('useAffiliationNavigation', () => () => ({ goToDashboard: vi.fn() }))

const reviewTask = { task: { todo: { header: { name: 'reviewImportedData', status: 'NEW' } } } }
const arTask = { task: { todo: { header: { name: 'annualReport', status: 'NEW' } } } }

async function mountModal () {
  const wrapper = mount(AddBusinessSuccess, {
    props: { businessName: 'TESTING CORP.', identifier: 'BC0888377' },
    global: {
      stubs: { ModalBase: { name: 'ModalBase', props: ['alert'], template: '<div><slot /></div>' } },
      mocks: { $tm: () => [], $rt: (s: string) => s }
    }
  })
  await flushPromises()
  return wrapper
}

const getAlert = (wrapper: Awaited<ReturnType<typeof mountModal>>) =>
  wrapper.findComponent({ name: 'ModalBase' }).props('alert')

describe('<ModalAddBusinessSuccess /> migration warning', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFlag = 'review-imported-data'
  })

  it('shows the warning when the business has a reviewImportedData todo', async () => {
    mockBusinessApi.mockResolvedValue({ tasks: [arTask, reviewTask] })
    const wrapper = await mountModal()
    expect(mockBusinessApi).toHaveBeenCalledWith('/businesses/BC0888377/tasks')
    expect(getAlert(wrapper)).toBeDefined()
  })

  it('hides the warning when the business has no migration issues', async () => {
    mockBusinessApi.mockResolvedValue({ tasks: [arTask] })
    const wrapper = await mountModal()
    expect(getAlert(wrapper)).toBeUndefined()
  })

  it('hides the warning when the tasks call fails', async () => {
    mockBusinessApi.mockRejectedValue(new Error('boom'))
    const wrapper = await mountModal()
    expect(getAlert(wrapper)).toBeUndefined()
  })

  it('does not fetch tasks when the feature flag is off', async () => {
    mockFlag = ''
    const wrapper = await mountModal()
    expect(mockBusinessApi).not.toHaveBeenCalled()
    expect(getAlert(wrapper)).toBeUndefined()
  })
})
