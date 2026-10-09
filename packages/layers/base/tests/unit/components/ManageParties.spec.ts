/* eslint-disable @typescript-eslint/no-explicit-any */
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ManageParties } from '#components'

const { mockRemoveParty, mockUndoParty, mockApplyTableEdits } = vi.hoisted(() => ({
  mockRemoveParty: vi.fn(),
  mockUndoParty: vi.fn(),
  mockApplyTableEdits: vi.fn()
}))

function party(firstName: string, options: {
  roleType?: RoleTypeUi
  cessationDate?: string | null
  actions?: ActionType[]
  isAdded?: boolean
} = {}) {
  const { roleType = RoleTypeUi.DIRECTOR, cessationDate = null, actions = [], isAdded = false } = options
  const state = {
    name: { partyType: PartyType.PERSON, firstName, middleName: '', lastName: 'DOE' },
    roles: [{ roleType, appointmentDate: '2020-12-22', cessationDate }],
    actions
  }
  return { new: state, old: isAdded ? undefined : state }
}

const tableState = ref<any[]>([])

mockNuxtImport('useManageParties', () => () => ({
  addingParty: ref(false),
  expandedState: ref<undefined>(undefined),
  tableState,
  addNewParty: vi.fn(),
  removeParty: mockRemoveParty,
  undoParty: mockUndoParty,
  applyTableEdits: mockApplyTableEdits
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
  props: { expanded: Object, data: Array, emptyText: String, allowedActions: Array, hideUndoRemove: Boolean },
  template: '<div />'
})

const ConnectPageSectionStub = defineComponent({
  name: 'ConnectPageSection',
  props: { heading: Object, actions: Array },
  template: '<div><slot name="header" /><slot /></div>'
})

const stubs = {
  UButton: true,
  UIcon: true,
  ConnectPageSection: ConnectPageSectionStub,
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

const getTable = (wrapper: any) => wrapper.findComponent(TablePartyStub)
const getTableNames = (wrapper: any) => getTable(wrapper).props('data').map((p: any) => p.new.name.firstName)
const hasAddButton = (wrapper: any) => !!wrapper.findComponent(ConnectPageSectionStub).props('actions')?.length

describe('ManageParties', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ceased tab', () => {
    beforeEach(() => {
      tableState.value = [
        party('ACTIVE'),
        party('CEASED', { cessationDate: '2022-12-08' }),
        party('ACTIVE2')
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
      expect(getTable(wrapper).props('emptyText')).toBe('No Ceased Directors')
    })

    it('only allows correcting a ceased party (no add, remove or role change)', async () => {
      const allowedActions = [
        ManageAllowedAction.ADD,
        ManageAllowedAction.NAME_CHANGE,
        ManageAllowedAction.ROLE_CHANGE,
        ManageAllowedAction.REMOVE
      ]
      const wrapper = await mountManageParties({ allowedActions })
      expect(getTable(wrapper).props('allowedActions')).toEqual(allowedActions)

      await wrapper.find('[data-testid="parties-tab-ceased"]').trigger('click')

      expect(getTable(wrapper).props('allowedActions')).toEqual([ManageAllowedAction.NAME_CHANGE])
    })

    it('maps the displayed row back to its index in the full table state', async () => {
      const wrapper = await mountManageParties()

      // ACTIVE2 is index 1 in the active tab but index 2 in the table state
      getTable(wrapper).vm.$emit('remove', { index: 1, original: tableState.value[2] })
      expect(mockRemoveParty).toHaveBeenCalledWith(expect.objectContaining({ index: 2 }))

      await wrapper.find('[data-testid="parties-tab-ceased"]').trigger('click')
      getTable(wrapper).vm.$emit('undo', { index: 0, original: tableState.value[1] })
      expect(mockUndoParty).toHaveBeenCalledWith(expect.objectContaining({ index: 1 }))
    })

    it('does not switch tabs while a party form is open', async () => {
      const wrapper = await mountManageParties({ activeParty: { name: {}, roles: [] } })

      await wrapper.find('[data-testid="parties-tab-ceased"]').trigger('click')

      expect(wrapper.find('[data-testid="parties-tab-active"]').attributes('aria-selected')).toBe('true')
      expect(wrapper.emitted('action-prevented')).toHaveLength(1)
    })

    it('shows a single table with all parties when the role type has no ceased tab', async () => {
      tableState.value = [
        party('ACTIVE', { roleType: RoleTypeUi.RECEIVER }),
        party('CEASED', { roleType: RoleTypeUi.RECEIVER, cessationDate: '2022-12-08' })
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

  describe('max parties', () => {
    const allowedActions = [ManageAllowedAction.ADD, ManageAllowedAction.EMAIL_CHANGE, ManageAllowedAction.REMOVE]
    const custodian = (firstName: string, actions: ActionType[] = [], isAdded = false) =>
      party(firstName, { roleType: RoleTypeUi.CUSTODIAN, actions, isAdded })
    const mountCustodians = (props: Record<string, unknown> = {}) => mountManageParties({
      subject: 'Custodian',
      tableTitle: 'Custodians',
      emptyText: 'No Custodians',
      roleType: RoleTypeUi.CUSTODIAN,
      allowedActions,
      ...props
    })

    beforeEach(() => {
      tableState.value = []
    })

    describe('maxParties = 1', () => {
      const maxParties = 1

      it('allows adding when there are no parties', async () => {
        const wrapper = await mountCustodians({ maxParties })

        expect(hasAddButton(wrapper)).toBe(true)
      })

      it('blocks adding and undoing a removal once the max is reached', async () => {
        tableState.value = [custodian('EXISTING')]
        const wrapper = await mountCustodians({ maxParties })

        expect(hasAddButton(wrapper)).toBe(false)
        expect(getTable(wrapper).props('allowedActions')).not.toContain(ManageAllowedAction.ADD)
        expect(getTable(wrapper).props('hideUndoRemove')).toBe(true)
      })

      it('allows every action except adding when allowedActions is not given', async () => {
        tableState.value = [custodian('EXISTING')]
        const wrapper = await mountCustodians({ maxParties, allowedActions: undefined })

        expect(hasAddButton(wrapper)).toBe(false)
        expect(getTable(wrapper).props('allowedActions')).toEqual(
          Object.values(ManageAllowedAction).filter(a => a !== ManageAllowedAction.ADD)
        )
      })

      it('allows adding and undoing a removal once the active party is removed', async () => {
        tableState.value = [custodian('EXISTING', [ActionType.REMOVED])]
        const wrapper = await mountCustodians({ maxParties })

        expect(hasAddButton(wrapper)).toBe(true)
        expect(getTable(wrapper).props('allowedActions')).toEqual(allowedActions)
        expect(getTable(wrapper).props('hideUndoRemove')).toBe(false)
      })

      it('blocks undoing the removal once a new party is added', async () => {
        tableState.value = [custodian('EXISTING', [ActionType.REMOVED]), custodian('NEW', [ActionType.ADDED], true)]
        const wrapper = await mountCustodians({ maxParties })

        expect(hasAddButton(wrapper)).toBe(false)
        expect(getTable(wrapper).props('hideUndoRemove')).toBe(true)
      })
    })

    describe('maxParties not set', () => {
      it('does not limit parties', async () => {
        tableState.value = [custodian('ONE'), custodian('TWO')]
        const wrapper = await mountCustodians()

        expect(hasAddButton(wrapper)).toBe(true)
        expect(getTable(wrapper).props('allowedActions')).toEqual(allowedActions)
        expect(getTable(wrapper).props('hideUndoRemove')).toBe(false)
      })
    })
  })
})
