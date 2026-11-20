import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { describe, expect, it, vi } from 'vitest'
import { FormLiquidatorDetails, FormPartyDetails, ManageParties } from '#components'

mockNuxtImport('useManageParties', () => () => ({
  tableState: ref([]),
  addSubject: vi.fn(),
  removeSubject: vi.fn(),
  undoSubject: vi.fn(),
  editSubject: vi.fn()
}))

mockNuxtImport('useFilingAlerts', () => () => ({
  alerts: reactive<Record<string, string>>({}),
  setAlert: vi.fn(),
  clearAlert: vi.fn(),
  attachAlerts: vi.fn(() => ({ targetId: 'target-id', messageId: 'message-id' }))
}))

const stubs = {
  UButton: defineComponent({ name: 'UButton', template: '<button @click="$attrs.onClick" />' }),
  UIcon: true,
  TableParty: true,
  ConnectPageSection: defineComponent({
    name: 'ConnectPageSection',
    props: { actions: Array },
    template: '<div><button data-testid="add-btn" @click="actions[0].onClick" /><slot /></div>'
  })
}

async function openAddForm(roleType: RoleTypeUi) {
  const wrapper = await mountSuspended(ManageParties, {
    props: { subject: 'Party', tableTitle: 'Parties', roleType },
    global: { stubs }
  })
  await wrapper.find('[data-testid="add-btn"]').trigger('click')
  return wrapper
}

describe('ManageParties - role specific sub form', () => {
  it('renders the liquidator form for liquidators', async () => {
    const wrapper = await openAddForm(RoleTypeUi.LIQUIDATOR)
    expect(wrapper.findComponent(FormLiquidatorDetails).exists()).toBe(true)
    expect(wrapper.findComponent(FormPartyDetails).exists()).toBe(false)
  })

  it('renders the party form for other role types', async () => {
    const wrapper = await openAddForm(RoleTypeUi.DIRECTOR)
    expect(wrapper.findComponent(FormPartyDetails).exists()).toBe(true)
    expect(wrapper.findComponent(FormLiquidatorDetails).exists()).toBe(false)
  })
})
