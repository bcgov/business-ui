/* eslint-disable @typescript-eslint/no-explicit-any */
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ManageParties } from '#components'

const { mockRemoveSubject, mockUndoSubject, mockEditSubject } = vi.hoisted(() => ({
  mockRemoveSubject: vi.fn(),
  mockUndoSubject: vi.fn(),
  mockEditSubject: vi.fn()
}))

function party(firstName: string, roleType: RoleTypeUi, cessationDate: string | null = null) {
  const state = {
    id: firstName,
    name: { partyType: PartyType.PERSON, firstName, middleName: '', lastName: 'DOE' },
    roles: [{ roleType, appointmentDate: '2020-12-22', cessationDate }],
    actions: []
  }
  return { new: state, old: state }
}

const tableState = ref<any[]>([])

mockNuxtImport('useManageParties', () => () => ({
  tableState,
  addSubject: vi.fn(),
  removeSubject: mockRemoveSubject,
  undoSubject: mockUndoSubject,
  editSubject: mockEditSubject
}))

mockNuxtImport('useFilingAlerts', () => () => ({
  alerts: reactive<Record<string, string>>({}),
  setAlert: vi.fn(),
  clearAlert: vi.fn(),
  attachAlerts: vi.fn(() => ({ targetId: 'target-id', messageId: 'message-id' }))
}))

mockNuxtImport('useConnectButtonControl', () => () => ({ setAlertText: vi.fn() }))

const TablePartyStub = defineComponent({
  name: 'TableParty',
  props: { expanded: Object, data: Array, emptyText: String, allowedActions: Array, showFormerName: Boolean },
  template: '<div />'
})

const stubs = {
  UButton: true,
  UIcon: true,
  ConnectPageSection: defineComponent({
    name: 'ConnectPageSection',
    template: '<div><slot name="header" /><slot /></div>'
  }),
  FormPartyDetails: true,
  TableParty: TablePartyStub
}

async function mountManageParties(props: Record<string, unknown> = {}) {
  return mountSuspended(ManageParties, {
    props: {
      subject: 'Director',
      tableTitle: 'Directors',
      emptyText: 'No Directors',
      roleType: RoleTypeUi.DIRECTOR,
      variant: 'correct',
      ...props
    } as any,
    global: { stubs }
  })
}

const getTableNames = (wrapper: any) =>
  wrapper.findComponent(TablePartyStub).props('data').map((p: any) => p.new.name.firstName)

describe('ManageParties - ceased tab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    tableState.value = [
      party('ACTIVE', RoleTypeUi.DIRECTOR),
      party('CEASED', RoleTypeUi.DIRECTOR, '2022-12-08'),
      party('ACTIVE2', RoleTypeUi.DIRECTOR)
    ]
  })

  it('shows the tabs and only the active parties by default', async () => {
    const wrapper = await mountManageParties()

    expect(wrapper.find('[data-testid="parties-tabs"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="parties-tab-active"]').text()).toContain('Directors')
    expect(wrapper.find('[data-testid="parties-tab-ceased"]').text()).toContain('Ceased Directors')
    expect(getTableNames(wrapper)).toEqual(['ACTIVE', 'ACTIVE2'])
  })

  it('shows only the ceased parties when the ceased tab is selected', async () => {
    const wrapper = await mountManageParties()

    await wrapper.find('[data-testid="parties-tab-ceased"]').trigger('click')

    expect(wrapper.find('[data-testid="parties-tab-ceased"]').attributes('aria-selected')).toBe('true')
    expect(getTableNames(wrapper)).toEqual(['CEASED'])
    expect(wrapper.findComponent(TablePartyStub).props('emptyText')).toBe('No Ceased Directors')
  })

  it('only allows correcting a ceased party (no add, remove or role change)', async () => {
    const allowedActions = [
      ManageAllowedAction.ADD,
      ManageAllowedAction.NAME_CHANGE,
      ManageAllowedAction.ROLE_CHANGE,
      ManageAllowedAction.REMOVE
    ]
    const wrapper = await mountManageParties({ allowedActions })
    expect(wrapper.findComponent(TablePartyStub).props('allowedActions')).toEqual(allowedActions)

    await wrapper.find('[data-testid="parties-tab-ceased"]').trigger('click')

    expect(wrapper.findComponent(TablePartyStub).props('allowedActions')).toEqual([ManageAllowedAction.NAME_CHANGE])
  })

  it('passes the displayed row straight to the composable (rows are matched by id)', async () => {
    const wrapper = await mountManageParties()
    const table = wrapper.findComponent(TablePartyStub)

    // ACTIVE2 is index 1 in the active tab but index 2 in the table state
    const activeRow = { index: 1, id: 'ACTIVE2', original: tableState.value[2] }
    table.vm.$emit('remove', activeRow)
    expect(mockRemoveSubject).toHaveBeenCalledWith(activeRow)

    await wrapper.find('[data-testid="parties-tab-ceased"]').trigger('click')
    const ceasedRow = { index: 0, id: 'CEASED', original: tableState.value[1] }
    wrapper.findComponent(TablePartyStub).vm.$emit('undo', ceasedRow)
    expect(mockUndoSubject).toHaveBeenCalledWith(ceasedRow)
  })

  it('does not switch tabs while a party form is open', async () => {
    const wrapper = await mountManageParties({ activeSubject: { name: {}, roles: [] } })

    await wrapper.find('[data-testid="parties-tab-ceased"]').trigger('click')

    expect(wrapper.find('[data-testid="parties-tab-active"]').attributes('aria-selected')).toBe('true')
    expect(wrapper.emitted('action-prevented')).toHaveLength(1)
  })

  it('shows a single table with all parties when the role type has no ceased tab', async () => {
    tableState.value = [
      party('ACTIVE', RoleTypeUi.RECEIVER),
      party('CEASED', RoleTypeUi.RECEIVER, '2022-12-08')
    ]
    const wrapper = await mountManageParties({ roleType: RoleTypeUi.RECEIVER })

    expect(wrapper.find('[data-testid="parties-tabs"]').exists()).toBe(false)
    expect(getTableNames(wrapper)).toEqual(['ACTIVE', 'CEASED'])
  })

  it('shows a single table with all parties when not correcting', async () => {
    const wrapper = await mountManageParties({ variant: 'default' })

    expect(wrapper.find('[data-testid="parties-tabs"]').exists()).toBe(false)
    expect(getTableNames(wrapper)).toEqual(['ACTIVE', 'CEASED', 'ACTIVE2'])
  })
})

describe('ManageParties - former name', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    tableState.value = [party('ACTIVE', RoleTypeUi.DIRECTOR)]
  })

  it('shows the former name in the table by default (an absent boolean prop must not become false)', async () => {
    const wrapper = await mountManageParties()

    expect(wrapper.findComponent(TablePartyStub).props('showFormerName')).toBe(true)
  })

  it('lets a table opt out of the former name', async () => {
    const wrapper = await mountManageParties({ showFormerName: false })

    expect(wrapper.findComponent(TablePartyStub).props('showFormerName')).toBe(false)
  })
})
