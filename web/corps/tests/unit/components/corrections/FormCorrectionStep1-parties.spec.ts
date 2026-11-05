import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import { FormCorrectionStep1 } from '#components'

mockNuxtImport('useCorrectionHelper', () => () => ({
  hasActiveSubForm: ref(false)
}))

const mockIsCorrectable = vi.fn()
mockNuxtImport('useCorrectionStore', original => () => {
  const orig = typeof original === 'function' ? original() : {}
  return {
    ...orig,
    isCorrectable: mockIsCorrectable
  }
})

const address = {
  street: '123 Main St',
  streetAdditional: '',
  city: 'Victoria',
  region: 'BC',
  postalCode: 'V8V 1A1',
  country: 'CA',
  locationDescription: ''
}

function getMockParty(roleType: RoleTypeUi) {
  return getPartySchema(roleType).parse({
    id: 'party-1',
    name: { partyType: 'person', firstName: 'Jane', middleName: '', lastName: 'Smith', preferredName: '' },
    address: { deliveryAddress: address, mailingAddress: address, sameAs: false },
    email: 'jane@example.com',
    roles: [{ roleType, appointmentDate: '2020-01-01', cessationDate: null }]
  })
}

// Mounts the real ManageParties inside the real parent UForm: the sub form reads
// its state from the parent's form state using `modelName`, so a stub can't catch a mismatch.
describe('FormCorrectionStep1 - ManageParties', () => {
  let unmount: (() => void) | undefined

  beforeEach(() => {
    setActivePinia(createPinia())
    clearNuxtState()
  })

  afterEach(() => {
    unmount?.()
    unmount = undefined
  })

  async function mountSection(section: CorrectionSection, stateKey: string, roleType: RoleTypeUi) {
    mockIsCorrectable.mockImplementation(s => s === section)
    const party = getMockParty(roleType)
    useManageParties(stateKey).tableState.value = [{ new: party, old: cloneDeep(party) }]

    const wrapper = await mountSuspended(FormCorrectionStep1, {
      global: {
        stubs: {
          ManageYourCompany: true,
          ManageOffices: true,
          ManageShareStructure: true,
          ManageCourtOrders: true,
          ManageAmalgamation: true
        }
      }
    })
    unmount = () => wrapper.unmount()
    const findButton = (label: string) => wrapper.findAll('button').find(b => b.text() === label)!

    await findButton('Correct').trigger('click')
    await flushPromises()
    return { wrapper, findButton }
  }

  it.each([
    [CorrectionSection.DIRECTORS, 'manage-directors', RoleTypeUi.DIRECTOR],
    [CorrectionSection.RECEIVERS, 'manage-receivers', RoleTypeUi.RECEIVER],
    [CorrectionSection.LIQUIDATORS, 'manage-liquidators', RoleTypeUi.LIQUIDATOR],
    [CorrectionSection.CUSTODIANS, 'manage-custodians', RoleTypeUi.CUSTODIAN]
  ])('should apply a valid correction and close the %s sub form on done', async (section, stateKey, roleType) => {
    const { findButton } = await mountSection(section, stateKey, roleType)
    const store = useCorrectionStore()
    expect(store.formState.activeParty).toBeDefined()

    store.formState.activeParty!.address.mailingAddress.city = 'Vancouver'
    await nextTick()
    await findButton('Done').trigger('click')
    await flushPromises()

    expect(store.formState.activeParty).toBeUndefined()
    const row = useManageParties(stateKey).tableState.value[0]!
    expect(row.new.address.mailingAddress.city).toBe('Vancouver')
    expect(row.new.actions).toContain(ActionType.ADDRESS_CHANGED)
  })

  it('should keep the sub form open and show a field error when a value is invalid', async () => {
    const { wrapper, findButton } = await mountSection(
      CorrectionSection.DIRECTORS,
      'manage-directors',
      RoleTypeUi.DIRECTOR
    )
    const store = useCorrectionStore()

    store.formState.activeParty!.address.mailingAddress.city = ''
    await nextTick()
    await findButton('Done').trigger('click')
    await flushPromises()

    expect(store.formState.activeParty).toBeDefined()
    expect(wrapper.text()).toContain('required')
  })
})
