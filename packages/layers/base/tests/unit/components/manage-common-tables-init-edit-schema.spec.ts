/* eslint-disable @typescript-eslint/no-explicit-any */
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { describe, expect, it, vi } from 'vitest'
import { ManageParties } from '#components'

mockNuxtImport('useManageParties', () => () => ({
  tableState: ref([]),
  addSubject: vi.fn(),
  removeSubject: vi.fn(),
  undoSubject: vi.fn(),
  editSubject: vi.fn()
}))

mockNuxtImport('useConnectButtonControl', () => () => ({ setAlertText: vi.fn() }))

// --- Stubs: lightweight stand-ins for child components ---

const TablePartyStub = defineComponent({ name: 'TableParty', props: { expanded: Object }, template: '<div />' })
const TableOfficesStub = defineComponent({ name: 'TableOffices', props: { expanded: Object }, template: '<div />' })

const stubs = {
  UButton: true,
  ConnectPageSection: defineComponent({ name: 'ConnectPageSection', template: '<div><slot /></div>' }),
  FormPartyDetails: true,
  FormOfficeDetails: true,
  FormAlertMessage: true,
  FormShareClass: true,
  FormShareSeries: true,
  TableParty: TablePartyStub,
  TableOffices: TableOfficesStub
}

// --- Helper: mount a component, emit init-edit, return the wrapper ---

async function emitInitEdit(
  component: typeof ManageParties,
  props: Record<string, unknown>,
  tableStub: ReturnType<typeof defineComponent>,
  row: Record<string, unknown>
) {
  // eslint-disable-next-line
  // @ts-ignore - test helper accepts loosely typed props for different component types
  const wrapper = await mountSuspended(component, { props, global: { stubs } }) as any
  wrapper.findComponent(tableStub).vm.$emit('init-edit', row)
  await wrapper.vm.$nextTick()
  return wrapper
}

// =============================================================================
// Each component's init-edit handler uses schema.safeParse():
//   - valid   → schema.parse() normalizes the data
//   - invalid → deep-clone passes the raw data through unchanged
// Both paths expand the row (keyed by row id).
// =============================================================================

describe('Common table managers — init-edit with invalid schema data', () => {
  it('ManageParties: emits raw data when schema is invalid', async () => {
    const row = { index: 0, id: 'p0', original: { new: { isEditing: false, id: 'p0', name: { partyType: 'BAD' } } } }
    const wrapper = await emitInitEdit(ManageParties,
      { addLabel: 'unused-label', sectionLabel: 'Parties', activeSubject: undefined },
      TablePartyStub, row)

    const emitted = wrapper.emitted('update:active-subject')?.[0]?.[0] as { name: { partyType: string } }
    expect(emitted.name.partyType).toBe('BAD')
    expect(wrapper.findComponent(TablePartyStub).props('expanded')).toEqual({ p0: true })
  })
})

describe('Common table managers — init-edit with valid schema data', () => {
  it('ManageParties: emits schema-parsed data when valid', async () => {
    const row = {
      index: 0, id: 'p1', original: { new: {
        isEditing: false, id: 'p1', actions: [],
        name: {
          partyType: PartyType.PERSON, firstName: 'A', lastName: 'B',
          middleName: '', businessName: '', hasPreferredName: false, preferredName: ''
        },
        roles: [{ roleType: RoleTypeUi.DIRECTOR }]
      } }
    }
    const wrapper = await emitInitEdit(ManageParties,
      { addLabel: 'unused-label', sectionLabel: 'Parties', activeSubject: undefined },
      TablePartyStub, row)

    const emitted = wrapper.emitted('update:active-subject')?.[0]?.[0] as {
      name: { partyType: string }
      address: { sameAs: boolean, mailingAddress: { country: string } }
    }
    expect(emitted.name.partyType).toBe(PartyType.PERSON)
    expect(emitted.address.sameAs).toBe(false)
    expect(emitted.address.mailingAddress.country).toBe('CA')
    expect(wrapper.findComponent(TablePartyStub).props('expanded')).toEqual({ p1: true })
  })
})
