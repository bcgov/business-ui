import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { describe, expect, it, vi } from 'vitest'

import { ManageShareStructure } from '#components'

// mutated per-test to control hasChangedShares/hasRightsOrRestrictions without re-registering the mock
const mockShareClasses = {
  // no actions on any class/series -> hasChangedShares is false this session
  value: [
    { new: { id: 'c1', name: 'A Shares', actions: [] as ActionType[], series: [], hasRightsOrRestrictions: true }, old: undefined }
  ]
}

mockNuxtImport('useManageShareStructure', () => () => ({
  expandedState: ref<undefined>(undefined),
  shareClasses: ref(mockShareClasses.value),
  resolutionDates: ref([]),
  addNewShareClass: vi.fn(),
  removeShareClass: vi.fn(),
  undoShareClass: vi.fn(),
  updateShareClass: vi.fn(),
  updateShareSeries: vi.fn(),
  undoShareSeries: vi.fn(),
  removeShareSeries: vi.fn(),
  addNewShareSeries: vi.fn(),
  changePriority: vi.fn(),
  updateResolutionDate: vi.fn(),
  removeResolutionDate: vi.fn(),
  undoResolutionDate: vi.fn()
}))

mockNuxtImport('useFilingAlerts', () => () => ({
  alerts: reactive<Record<string, string>>({}),
  setAlert: vi.fn(),
  clearAlert: vi.fn(),
  attachAlerts: vi.fn(() => ({ targetId: 'target-id', messageId: 'message-id' }))
}))

mockNuxtImport('useConnectButtonControl', () => () => ({ setAlertText: vi.fn() }))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string, params?: { name?: string }) => params?.name || key })
}))

const stubs = {
  UButton: true,
  USeparator: true,
  HelpExpansion: true,
  ConnectPageSection: defineComponent({ name: 'ConnectPageSection', template: '<div><slot /></div>' }),
  ConnectFieldset: defineComponent({ name: 'ConnectFieldset', template: '<div><slot /></div>' }),
  FormShareClass: true,
  FormShareSeries: true,
  FormShareResolutionDate: defineComponent({
    name: 'FormShareResolutionDate',
    props: ['validationContext'],
    template: '<div data-testid="rd-form" :data-required="!!validationContext?.hasRightsOrRestrictions" />'
  }),
  TableShareStructure: defineComponent({ name: 'TableShareStructure', props: { expanded: Object }, template: '<div />' }),
  TableShareStructureResolutionDates: defineComponent({
    name: 'TableShareStructureResolutionDates',
    props: { expanded: Object },
    template: '<div />'
  })
}

describe('ManageShareStructure — resolution date add section in correction', () => {
  it('shows the add-resolution-date input in a correction filing even when shares were not changed this session', async () => {
    const wrapper = await mountSuspended(ManageShareStructure, {
      props: {
        variant: 'correct',
        collectResolutionDate: true
      },
      global: { stubs }
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="rd-form"]').exists()).toBe(true)
  })

  // note: collectResolutionDate does not gate the 'correct' variant (see previous test) —
  // only non-correct variants fall through to resolutionDateRequired, which does check it
  it('hides the add-resolution-date input when collectResolutionDate is false and variant is not correct', async () => {
    const wrapper = await mountSuspended(ManageShareStructure, {
      props: {
        variant: 'change',
        collectResolutionDate: false
      },
      global: { stubs }
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="rd-form"]').exists()).toBe(false)
  })

  it('does not require a resolution date in a correction filing even when a new share class with rights or restrictions was added', async () => {
    // a share class was added this session and has rights/restrictions -> would require a
    // resolution date outside of corrections (see equivalent 'change' variant test below)
    mockShareClasses.value = [
      { new: { id: 'c1', name: 'A Shares', actions: [ActionType.ADDED], series: [], hasRightsOrRestrictions: true }, old: undefined }
    ]

    const wrapper = await mountSuspended(ManageShareStructure, {
      props: {
        variant: 'correct',
        collectResolutionDate: true
      },
      global: { stubs }
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    const form = wrapper.find('[data-testid="rd-form"]')
    expect(form.exists()).toBe(true)
    expect(form.attributes('data-required')).toBe('false')
  })

  it('requires a resolution date outside of corrections when a new share class with rights or restrictions was added', async () => {
    mockShareClasses.value = [
      { new: { id: 'c1', name: 'A Shares', actions: [ActionType.ADDED], series: [], hasRightsOrRestrictions: true }, old: undefined }
    ]

    const wrapper = await mountSuspended(ManageShareStructure, {
      props: {
        variant: 'change',
        collectResolutionDate: true
      },
      global: { stubs }
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    const form = wrapper.find('[data-testid="rd-form"]')
    expect(form.exists()).toBe(true)
    expect(form.attributes('data-required')).toBe('true')
  })
})
