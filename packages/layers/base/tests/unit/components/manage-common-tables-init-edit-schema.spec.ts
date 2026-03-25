import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, reactive, ref } from 'vue'

import { ManageParties, ManageOffices, ManageShareStructure } from '#components'

// --- Mock composables used by the three manager components ---

mockNuxtImport('useManageParties', () => () => ({
  addingParty: ref(false),
  expandedState: ref<undefined>(undefined),
  tableState: ref([]),
  addNewParty: vi.fn(),
  removeParty: vi.fn(),
  undoParty: vi.fn(),
  applyTableEdits: vi.fn()
}))

mockNuxtImport('useManageOffices', () => () => ({
  addingOffice: ref(false),
  expandedState: ref<undefined>(undefined),
  tableState: ref([]),
  addNewOffice: vi.fn(),
  removeOffice: vi.fn(),
  undoOffice: vi.fn(),
  applyTableEdits: vi.fn()
}))

mockNuxtImport('useManageShareStructure', () => () => ({
  expandedState: ref<undefined>(undefined),
  tableState: ref([]),
  addNewShareClass: vi.fn(),
  removeShareClass: vi.fn(),
  undoShareClass: vi.fn(),
  updateShareClass: vi.fn(),
  updateShareSeries: vi.fn(),
  undoShareSeries: vi.fn(),
  removeShareSeries: vi.fn(),
  addNewShareSeries: vi.fn(),
  changePriority: vi.fn()
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

// --- Stubs: lightweight stand-ins for child components ---

const TablePartyStub = defineComponent({ name: 'TableParty', props: { expanded: Object }, template: '<div />' })
const TableOfficesStub = defineComponent({ name: 'TableOffices', props: { expanded: Object }, template: '<div />' })
const TableShareStructureStub = defineComponent({
  name: 'TableShareStructure',
  props: { expanded: Object },
  template: '<div />'
})

const stubs = {
  UButton: true,
  ConnectPageSection: defineComponent({ name: 'ConnectPageSection', template: '<div><slot /></div>' }),
  FormPartyDetails: true,
  FormOfficeDetails: true,
  FormAlertMessage: true,
  FormShareClass: true,
  FormShareSeries: true,
  TableParty: TablePartyStub,
  TableOffices: TableOfficesStub,
  TableShareStructure: TableShareStructureStub
}

// --- Helper: mount a component, emit init-edit, return the wrapper ---

async function emitInitEdit(
  component: typeof ManageParties | typeof ManageOffices | typeof ManageShareStructure,
  props: Record<string, unknown>,
  tableStub: ReturnType<typeof defineComponent>,
  row: Record<string, unknown>
) {
  // @ts-expect-error - test helper accepts loosely typed props for different component types
  const wrapper = await mountSuspended(component, { props, global: { stubs } })
  wrapper.findComponent(tableStub).vm.$emit('init-edit', row)
  await wrapper.vm.$nextTick()
  return wrapper
}

// =============================================================================
// Each component's init-edit handler uses schema.safeParse():
//   - valid   → schema.parse() normalizes the data
//   - invalid → JSON deep-clone passes the raw data through unchanged
// Both paths set isEditing = true and expand the row.
// =============================================================================

describe('Common table managers — init-edit with invalid schema data', () => {
  it('ManageParties: emits raw data when schema is invalid', async () => {
    const row = { index: 0, original: { new: { isEditing: false, name: { partyType: 'BAD' } } } }
    const wrapper = await emitInitEdit(ManageParties,
      { addLabel: 'unused-label', sectionLabel: 'Parties', activeParty: undefined },
      TablePartyStub, row)

    const emitted = wrapper.emitted('update:active-party')?.[0]?.[0] as { name: { partyType: string } }
    expect(emitted.name.partyType).toBe('BAD')
    expect(row.original.new.isEditing).toBe(true)
  })

  it('ManageOffices: emits raw data when schema is invalid', async () => {
    const row = { index: 0, original: { new: { isEditing: false, type: 'BAD' } } }
    const wrapper = await emitInitEdit(ManageOffices,
      { addLabel: 'unused-label', sectionLabel: 'Offices', activeOffice: undefined },
      TableOfficesStub, row)

    const emitted = wrapper.emitted('update:active-office')?.[0]?.[0] as { type: string }
    expect(emitted.type).toBe('BAD')
    expect(row.original.new.isEditing).toBe(true)
  })

  it('ManageShareStructure class: emits raw data when schema is invalid', async () => {
    const row = { id: 'c1', depth: 0, original: { new: { isEditing: false, name: 'X', priority: 'BAD' } } }
    const wrapper = await emitInitEdit(ManageShareStructure,
      { addLabel: 'unused-label', activeClass: undefined, activeSeries: undefined },
      TableShareStructureStub, row)

    const emitted = wrapper.emitted('update:active-class')?.[0]?.[0] as { priority: string }
    expect(emitted.priority).toBe('BAD')
    expect(row.original.new.isEditing).toBe(true)
  })

  it('ManageShareStructure series: emits raw data when schema is invalid', async () => {
    const row = { id: 's1', depth: 1, original: { new: { isEditing: false, name: 'X', priority: 'BAD' } } }
    const wrapper = await emitInitEdit(ManageShareStructure,
      { addLabel: 'unused-label', activeClass: undefined, activeSeries: undefined },
      TableShareStructureStub, row)

    const emitted = wrapper.emitted('update:active-series')?.[0]?.[0] as { priority: string }
    expect(emitted.priority).toBe('BAD')
    expect(row.original.new.isEditing).toBe(true)
  })
})

describe('Common table managers — init-edit with valid schema data', () => {
  it('ManageParties: emits schema-parsed data when valid', async () => {
    const row = {
      index: 0, original: { new: {
        isEditing: false, id: 'p1', actions: [],
        name: {
          partyType: PartyType.PERSON, firstName: 'A', lastName: 'B',
          middleName: '', businessName: '', hasPreferredName: false, preferredName: ''
        },
        roles: [{ roleType: RoleTypeUi.DIRECTOR }]
      } }
    }
    const wrapper = await emitInitEdit(ManageParties,
      { addLabel: 'unused-label', sectionLabel: 'Parties', activeParty: undefined },
      TablePartyStub, row)

    const emitted = wrapper.emitted('update:active-party')?.[0]?.[0] as {
      name: { partyType: string }
      address: { sameAs: boolean, mailingAddress: { country: string } }
    }
    expect(emitted.name.partyType).toBe(PartyType.PERSON)
    expect(emitted.address.sameAs).toBe(false)
    expect(emitted.address.mailingAddress.country).toBe('CA')
    expect(row.original.new.isEditing).toBe(true)
  })

  it('ManageOffices: emits schema-parsed data when valid', async () => {
    const row = { index: 0, original: { new: { isEditing: false, actions: [] } } }
    const wrapper = await emitInitEdit(ManageOffices,
      { addLabel: 'unused-label', sectionLabel: 'Offices', activeOffice: undefined },
      TableOfficesStub, row)

    const emitted = wrapper.emitted('update:active-office')?.[0]?.[0] as {
      type: string
      address: { sameAs: boolean, mailingAddress: { country: string } }
    }
    expect(emitted.type).toBe(OfficeType.REGISTERED)
    expect(emitted.address.sameAs).toBe(false)
    expect(emitted.address.mailingAddress.country).toBe('CA')
    expect(row.original.new.isEditing).toBe(true)
  })

  it('ManageShareStructure class: emits schema-parsed data when valid', async () => {
    const row = {
      id: 'c1', depth: 0, original: { new: {
        isEditing: false, id: 'c1', name: 'Alpha', priority: 1, actions: [],
        hasParValue: false, hasMaximumShares: false
      } }
    }
    const wrapper = await emitInitEdit(ManageShareStructure,
      { addLabel: 'unused-label', activeClass: undefined, activeSeries: undefined },
      TableShareStructureStub, row)

    const emitted = wrapper.emitted('update:active-class')?.[0]?.[0] as {
      name: string
      series: unknown[]
      hasRightsOrRestrictions: boolean
    }
    expect(emitted.name).toBe('Alpha')
    expect(emitted.series).toEqual([])
    expect(emitted.hasRightsOrRestrictions).toBe(false)
    expect(row.original.new.isEditing).toBe(true)
  })

  it('ManageShareStructure series: emits schema-parsed data when valid', async () => {
    const row = {
      id: 's1', depth: 1, original: { new: {
        isEditing: false, id: 's1', name: 'Beta', priority: 1, actions: []
      } }
    }
    const wrapper = await emitInitEdit(ManageShareStructure,
      { addLabel: 'unused-label', activeClass: undefined, activeSeries: undefined },
      TableShareStructureStub, row)

    const emitted = wrapper.emitted('update:active-series')?.[0]?.[0] as {
      name: string
      hasMaximumShares: boolean
      hasRightsOrRestrictions: boolean
      isInvalid: boolean
    }
    expect(emitted.name).toBe('Beta')
    expect(emitted.hasMaximumShares).toBe(false)
    expect(emitted.hasRightsOrRestrictions).toBe(false)
    expect(emitted.isInvalid).toBe(false)
    expect(row.original.new.isEditing).toBe(true)
  })
})
