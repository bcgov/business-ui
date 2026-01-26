/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useFilingAlerts } from '#business/app/composables/useFilingAlerts'
import { mount, flushPromises } from '@vue/test-utils'

describe('useFilingAlerts', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllTimers()
  })

  function createMockElement() {
    return Object.assign(document.createElement('div'), {
      scrollIntoView: vi.fn(),
      focus: vi.fn()
    })
  }

  describe('Alerts', () => {
    it('should set and clear alerts', async () => {
      const { setAlert, clearAlert, alerts } = useFilingAlerts('basic')

      await setAlert('focus-target-id', 'Error message')
      expect(alerts.value['focus-target-id']).toBe('Error message')

      clearAlert('focus-target-id')
      expect(alerts.value['focus-target-id']).toBeUndefined()
    })

    it('should clear all alerts when no params given', async () => {
      const { setAlert, clearAlert, alerts } = useFilingAlerts('all-alerts')

      await setAlert('focus-target-id-1', 'Error 1')
      await setAlert('focus-target-id-2', 'Error 2')

      clearAlert()
      expect(alerts.value).toEqual({})
    })
  })

  describe('watchAlertAndFocus', () => {
    it('should scroll into view and focus when an alert is set', async () => {
      const { setAlert, watchAlertAndFocus } = useFilingAlerts('focus-group')

      const mockElement = createMockElement()
      vi.spyOn(document, 'querySelector').mockReturnValue(mockElement as any)

      watchAlertAndFocus('focus-target-id')

      await setAlert('focus-target-id', 'Error Message')

      await flushPromises()
      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center'
      })

      vi.advanceTimersByTime(100)
      expect(mockElement.focus).toHaveBeenCalled()
    })
  })

  describe('autoClear', () => {
    it('should clear the alert when the model ref changes', async () => {
      const { setAlert, autoClear, alerts } = useFilingAlerts('auto-clear')
      const model = ref('initial')

      autoClear('focus-target-id', model)
      await setAlert('focus-target-id', 'Old Error')

      await flushPromises()
      expect(alerts.value['focus-target-id']).toBe('Old Error')

      model.value = 'updated'

      await flushPromises()
      expect(alerts.value['focus-target-id']).toBeUndefined()
    })
  })

  describe('attachAlerts', () => {
    it('should return target and message ID and clear alert on unmounted', async () => {
      const { setAlert, attachAlerts, alerts } = useFilingAlerts('attach-group')
      const model = ref('')

      const TestComponent = defineComponent({
        setup() {
          const ids = attachAlerts('focus-target-id', model)
          return { ids }
        },
        template: '<div></div>'
      })

      const wrapper = mount(TestComponent)
      await setAlert('focus-target-id', 'Error Message')

      expect(wrapper.vm.ids).toEqual({
        targetId: 'alert-target-attach-group-focus-target-id',
        messageId: 'alert-message-attach-group-focus-target-id'
      })

      wrapper.unmount()
      expect(alerts.value['focus-target-id']).toBeUndefined()
    })

    it('should init watchAlertAndFocus and autoClear', async () => {
      const { setAlert, attachAlerts, alerts } = useFilingAlerts('inits')
      const model = ref('initial')

      const mockElement = createMockElement()
      vi.spyOn(document, 'querySelector').mockReturnValue(mockElement)

      const TestComponent = defineComponent({
        setup() {
          attachAlerts('focus-target-id', model)
          return {}
        },
        template: '<div></div>'
      })

      const wrapper = mount(TestComponent)

      await setAlert('focus-target-id', 'Error Message')
      await flushPromises()
      expect(mockElement.scrollIntoView).toHaveBeenCalled()

      model.value = 'changed'
      await flushPromises()
      expect(alerts.value['focus-target-id']).toBeUndefined()

      wrapper.unmount()
    })
  })
})
