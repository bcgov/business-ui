import { describe, it, expect, beforeEach, vi } from 'vitest'
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

// Mounts the real ManageCourtOrders inside the real parent UForm: the sub form reads
// its state from the parent's form state using `modelName`, so a stub can't catch a mismatch.
describe('FormCorrectionStep1 - ManageCourtOrders', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    clearNuxtState()
    mockIsCorrectable.mockImplementation(section => section === CorrectionSection.COURT_ORDERS)
  })

  it('should close the sub form and update the row when done is clicked on a valid court order', async () => {
    const subject = getCourtOrderPoaFullSchema().parse({ fileNumber: 'S123456', orderDetails: 'details' })
    useManageCourtOrders().tableState.value = [{ new: subject, old: cloneDeep(subject) }]

    const wrapper = await mountSuspended(FormCorrectionStep1, {
      global: {
        stubs: {
          ManageYourCompany: true,
          ManageParties: true,
          ManageShareStructure: true,
          ManageAmalgamation: true,
          ManageOffices: true
        }
      }
    })
    const store = useCorrectionStore()

    const findButton = (label: string) => wrapper.findAll('button').find(b => b.text() === label)!

    await findButton('Correct').trigger('click')
    await flushPromises()
    expect(store.formState.activeCourtOrder).toBeDefined()

    store.formState.activeCourtOrder!.fileNumber = 'S999999'
    await nextTick()
    await findButton('Done').trigger('click')
    await flushPromises()

    expect(store.formState.activeCourtOrder).toBeUndefined()
    expect(useManageCourtOrders().tableState.value[0]!.new.fileNumber).toBe('S999999')
  })
})
