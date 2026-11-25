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
let mockAuthorizedActions: string[] = []
mockNuxtImport('useConnectLaunchdarklyStore', () => () => ({ getStoredFlag: () => mockFlag }))
mockNuxtImport('useBrdModals', () => () => ({ close: vi.fn() }))
mockNuxtImport('useAffiliationsStore', () => () => ({ loadAffiliations: vi.fn() }))
mockNuxtImport('IsAuthorized', () => (action: string) => mockAuthorizedActions.includes(action))
mockNuxtImport('useAffiliationNavigation', () => () => ({ goToDashboard: vi.fn() }))

const reviewTodo = { task: { todo: { header: { name: 'reviewImportedData', status: 'NEW' } } } }
const reviewDraft = { task: { filing: { header: { name: 'reviewImportedData', status: 'DRAFT' } } } }
const arTodo = { task: { todo: { header: { name: 'annualReport', status: 'NEW' } } } }

function mountModal () {
  return mount(AddBusinessSuccess, {
    props: { businessName: 'TESTING CORP.', identifier: 'BC0888377' },
    global: {
      stubs: { ModalBase: { name: 'ModalBase', props: ['alert'], template: '<div><slot /></div>' } },
      mocks: { $tm: () => [], $rt: (s: string) => s }
    }
  })
}

const getAlert = (wrapper: ReturnType<typeof mountModal>) =>
  wrapper.findComponent({ name: 'ModalBase' }).props('alert')

describe('<ModalAddBusinessSuccess /> migration warning', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFlag = 'review-imported-data'
    mockAuthorizedActions = ['REVIEW_IMPORTED_DATA_FILING']
  })

  it('shows the warning when the business has a reviewImportedData todo', async () => {
    mockBusinessApi.mockResolvedValue({ tasks: [arTodo, reviewTodo] })
    const wrapper = mountModal()
    await flushPromises()
    expect(mockBusinessApi).toHaveBeenCalledWith('/businesses/BC0888377/tasks')
    expect(getAlert(wrapper)).toBeDefined()
  })

  it('shows the warning when the business has a reviewImportedData draft', async () => {
    mockBusinessApi.mockResolvedValue({ tasks: [reviewDraft, arTodo] })
    const wrapper = mountModal()
    await flushPromises()
    expect(getAlert(wrapper)).toBeDefined()
  })

  it('hides the warning when the business has no migration issues', async () => {
    mockBusinessApi.mockResolvedValue({ tasks: [arTodo] })
    const wrapper = mountModal()
    await flushPromises()
    expect(getAlert(wrapper)).toBeUndefined()
  })

  it('hides the warning when the tasks call fails', async () => {
    mockBusinessApi.mockRejectedValue(new Error('boom'))
    const wrapper = mountModal()
    await flushPromises()
    expect(getAlert(wrapper)).toBeUndefined()
  })

  it('shows a loading placeholder until the tasks call resolves', async () => {
    let resolveTasks: (value: unknown) => void = () => {}
    mockBusinessApi.mockReturnValue(new Promise((resolve) => { resolveTasks = resolve }))
    const wrapper = mountModal()
    await flushPromises()
    expect(wrapper.find('[data-testid="migration-check-loading"]').exists()).toBe(true)
    resolveTasks({ tasks: [reviewTodo] })
    await flushPromises()
    expect(wrapper.find('[data-testid="migration-check-loading"]').exists()).toBe(false)
    expect(getAlert(wrapper)).toBeDefined()
  })

  it('does not fetch tasks when the user lacks the review permission', async () => {
    mockAuthorizedActions = []
    const wrapper = mountModal()
    await flushPromises()
    expect(mockBusinessApi).not.toHaveBeenCalled()
    expect(getAlert(wrapper)).toBeUndefined()
  })

  it('does not fetch tasks when the feature flag is off', async () => {
    mockFlag = ''
    const wrapper = mountModal()
    await flushPromises()
    expect(mockBusinessApi).not.toHaveBeenCalled()
    expect(getAlert(wrapper)).toBeUndefined()
  })
})
