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

// Mounts the real ManageOffices inside the real parent UForm: the sub form reads
// its state from the parent's form state using `modelName`, so a stub can't catch a mismatch.
describe('FormCorrectionStep1 - ManageOffices', () => {
  let unmount: (() => void) | undefined

  beforeEach(() => {
    setActivePinia(createPinia())
    clearNuxtState()
    mockIsCorrectable.mockImplementation(section => section === CorrectionSection.OFFICES)
  })

  afterEach(() => {
    unmount?.()
    unmount = undefined
  })

  async function openSubForm() {
    const office = createDefaultOffice({
      id: 'office-1',
      address: { deliveryAddress: { ...address }, mailingAddress: { ...address }, sameAs: false }
    })
    useManageOffices().tableState.value = [{ new: office, old: cloneDeep(office) }]

    const wrapper = await mountSuspended(FormCorrectionStep1, {
      global: {
        stubs: {
          ManageYourCompany: true,
          ManageParties: true,
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

  it('should apply a valid correction and close the sub form on done', async () => {
    const { findButton } = await openSubForm()
    const store = useCorrectionStore()
    expect(store.formState.activeOffice).toBeDefined()

    store.formState.activeOffice!.address.mailingAddress.city = 'Vancouver'
    await nextTick()
    await findButton('Done').trigger('click')
    await flushPromises()

    expect(store.formState.activeOffice).toBeUndefined()
    const row = useManageOffices().tableState.value[0]!
    expect(row.new.address.mailingAddress.city).toBe('Vancouver')
    expect(row.new.actions).toContain(ActionType.CHANGED)
  })

  it('should keep the sub form open and show a field error when a value is invalid', async () => {
    const { wrapper, findButton } = await openSubForm()
    const store = useCorrectionStore()

    store.formState.activeOffice!.address.mailingAddress.city = ''
    await nextTick()
    await findButton('Done').trigger('click')
    await flushPromises()

    expect(store.formState.activeOffice).toBeDefined()
    expect(wrapper.text()).toContain('required')
  })
})
