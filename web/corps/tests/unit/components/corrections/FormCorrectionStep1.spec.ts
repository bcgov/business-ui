/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import { FormCorrectionStep1, ManageOffices } from '#components'

const mockHasActiveSubForm = ref(false)
mockNuxtImport('useCorrectionHelper', () => () => ({
  hasActiveSubForm: mockHasActiveSubForm
}))

const mockIsCorrectable = vi.fn()
mockNuxtImport('useCorrectionStore', original => () => {
  const orig = typeof original === 'function' ? original() : {}
  return {
    ...orig,
    isCorrectable: mockIsCorrectable
  }
})

function mountComponent() {
  return mountSuspended(FormCorrectionStep1, {
    global: {
      stubs: {
        UForm: { template: '<form><slot /></form>' },
        ManageYourCompany: true,
        ManageParties: true,
        ManageShareStructure: true,
        ManageCourtOrders: true,
        ManageAmalgamation: true,
        ManageOffices: true
      }
    }
  })
}

describe('FormCorrectionStep1', () => {
  let wrapper: ReturnType<typeof mountSuspended>

  beforeEach(async () => {
    vi.clearAllMocks()
    setActivePinia(createPinia())

    mockHasActiveSubForm.value = false
    mockIsCorrectable.mockReturnValue(true)

    wrapper = await mountComponent()
  })

  describe('ManageOffices', () => {
    it('should bind activeOffice model with store.formState', async () => {
      const correctionStore = useCorrectionStore()
      const mockOffice = { id: 1, name: 'Registered Office' } as any

      const manageOffices = wrapper.findComponent(ManageOffices)

      await manageOffices.vm.$emit('update:activeOffice', mockOffice)

      expect(correctionStore.formState.activeOffice).toEqual(mockOffice)
    })

    it('should have correct props', async () => {
      const component = wrapper.findComponent(ManageOffices)
      expect(component.exists()).toBe(true)

      expect(component.props('emptyText')).toBeDefined()
      expect(component.props('tableTitle')).toBeDefined()
      expect(component.props('subject')).toBe('')
      expect(component.props('variant')).toBe('correct')
      expect(component.props('bcCanadaOnly')).toBe(true)
      expect(component.props('allowedActions')).toEqual(['ADDRESS_CHANGE'])

      expect(component.attributes('data-testid')).toBe('office-addresses-section')

      mockHasActiveSubForm.value = true
      await nextTick()
      expect(component.props('preventActions')).toBe(true)
      mockHasActiveSubForm.value = false
      await nextTick()
      expect(component.props('preventActions')).toBe(false)
    })

    it('should increment actionPreventedSignal when @action-prevented is emitted', async () => {
      const component = wrapper.findComponent(ManageOffices)
      const initialSignal = component.props('actionPreventedSignal')

      await component.vm.$emit('action-prevented')

      expect(component.props('actionPreventedSignal')).toBe(initialSignal + 1)
    })

    it('should render ManageOffices when OFFICES is correctable', async () => {
      mockIsCorrectable.mockReturnValue(true)

      const wrapper = await mountComponent()
      expect(wrapper.findComponent(ManageOffices).exists()).toBe(true)
    })

    it('should not render ManageOffices when OFFICES is not correctable', async () => {
      mockIsCorrectable.mockReturnValue(false)

      const wrapper = await mountComponent()
      expect(wrapper.findComponent(ManageOffices).exists()).toBe(false)
    })
  })
})
