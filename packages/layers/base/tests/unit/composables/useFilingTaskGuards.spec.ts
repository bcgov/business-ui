/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useFilingTaskGuards } from '#business/app/composables/useFilingTaskGuards'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'

const mockModalOpen = vi.fn()
mockNuxtImport('useFilingModals', () => () => ({
  openUnsavedChangesModal: mockModalOpen
}))

const mockRoute = { query: {} } as any
mockNuxtImport('useRoute', () => () => mockRoute)

describe('useFilingTaskGuards', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('hasChanges', () => {
    it('should track changes and update', async () => {
      const initial = { name: 'John' }
      const current = ref({ name: 'John' })

      const { hasChanges } = useFilingTaskGuards([[initial, current]])

      expect(hasChanges.value).toBe(false)

      current.value.name = 'Johnathon'
      await nextTick()

      expect(hasChanges.value).toBe(false)

      vi.advanceTimersByTime(150)
      expect(current.value.name).toBe('Johnathon')
      expect(hasChanges.value).toBe(true)
    })

    it('should return to false if reverted to initial state', async () => {
      const initial = { count: 1 }
      const current = ref({ count: 1 })
      const { hasChanges } = useFilingTaskGuards([[initial, current]])

      current.value.count = 2
      await nextTick()
      vi.advanceTimersByTime(150)
      expect(hasChanges.value).toBe(true)

      current.value.count = 1
      await nextTick()
      vi.advanceTimersByTime(150)
      expect(hasChanges.value).toBe(false)
    })

    it('should track deep changes', async () => {
      const initial = [{ id: 1, actions: [] }]
      const current = ref([{ id: 1, actions: [] }] as any)
      const { hasChanges } = useFilingTaskGuards([[initial, current]])

      current.value[0]!.actions.push({ type: 'ADD' })

      await nextTick()
      vi.advanceTimersByTime(150)
      expect(hasChanges.value).toBe(true)
    })

    it('should track multiple inputs', async () => {
      const groupA = [{ a: 1 }, ref({ a: 1 })] as any
      const groupB = [{ b: 1 }, ref({ b: 1 })] as any

      const { hasChanges } = useFilingTaskGuards([groupA, groupB])

      groupB[1].value.b = 99

      await nextTick()
      vi.advanceTimersByTime(150)
      expect(hasChanges.value).toBe(true)
    })
  })

  describe('canSubmit', () => {
    beforeEach(() => {
      mockRoute.query = {}
    })

    it('should not allow submit if no changes and no draft', () => {
      const { canSubmit } = useFilingTaskGuards([[{}, {}]])
      expect(canSubmit()).toBe(false)
    })

    it('should allow submit if theres a draft even with no changes', () => {
      mockRoute.query = { draft: '123' }
      const { canSubmit } = useFilingTaskGuards([[{}, {}]])
      expect(canSubmit()).toBe(true)
    })

    it('submitCondition param should not allow submit even if theres a draft', () => {
      mockRoute.query = { draft: '123' }
      const condition = ref(false)
      const { canSubmit } = useFilingTaskGuards([[{}, {}]], condition)

      expect(canSubmit()).toBe(false)
    })
  })

  describe('canSave', () => {
    it('should return hasChanges status', async () => {
      const initial = { a: 1 }
      const current = ref({ a: 1 })
      const { canSave } = useFilingTaskGuards([[initial, current]])

      expect(canSave()).toBe(false)

      current.value.a = 2
      await nextTick()
      vi.advanceTimersByTime(150)
      await nextTick()

      expect(canSave()).toBe(true)
    })
  })

  describe('canCancel', () => {
    it('opens modal and returns false when changes exist', async () => {
      const initial = { a: 1 }
      const current = ref({ a: 1 })
      const { canCancel } = useFilingTaskGuards([[initial, current]])
      await nextTick()
      current.value.a = 2
      await nextTick()
      vi.advanceTimersByTime(150)
      await nextTick()

      const result = canCancel()

      expect(result).toBe(false)
      expect(mockModalOpen).toHaveBeenCalled()
    })

    it('does not open modal and returns true when no changes exist', () => {
      const { canCancel } = useFilingTaskGuards([[{ a: 1 }, { a: 1 }]])

      const result = canCancel()

      expect(result).toBe(true)
      expect(mockModalOpen).not.toHaveBeenCalled()
    })
  })

  describe('window beforeUnload event', () => {
    it('adds beforeunload listener on init', () => {
      const addSpy = vi.spyOn(window, 'addEventListener')
      const { initBeforeUnload } = useFilingTaskGuards([])
      initBeforeUnload()

      expect(addSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function), undefined)
    })

    it('prevents default on beforeunload if changes exist', async () => {
      const addSpy = vi.spyOn(window, 'addEventListener')
      const initial = { val: 1 }
      const current = ref({ val: 1 })

      const { initBeforeUnload, hasChanges } = useFilingTaskGuards([[initial, current]])
      initBeforeUnload()

      current.value.val = 2
      await nextTick()
      vi.advanceTimersByTime(150)
      await nextTick()

      expect(hasChanges.value).toBe(true)

      const addCall = addSpy.mock.calls[0]![1] as any
      const event = { preventDefault: vi.fn(), returnValue: false }
      addCall(event)

      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('should not prevent default if changes are reverted', async () => {
      const addSpy = vi.spyOn(window, 'addEventListener')
      const initial = ref(1)
      const current = ref(2)
      const { initBeforeUnload } = useFilingTaskGuards([[initial, current]])
      initBeforeUnload()
      const addCall = addSpy.mock.calls[0]![1] as any

      current.value = 2
      await nextTick()
      current.value = 1
      await nextTick()
      vi.advanceTimersByTime(150)
      await nextTick()

      const event = { preventDefault: vi.fn() }
      addCall(event)

      expect(event.preventDefault).not.toHaveBeenCalled()
    })

    it('removes listener when revokeBeforeUnload is called', () => {
      const addSpy = vi.spyOn(window, 'addEventListener')
      const removeSpy = vi.spyOn(window, 'removeEventListener')
      const { initBeforeUnload, revokeBeforeUnload } = useFilingTaskGuards([])

      initBeforeUnload()
      const beforeUnloadEvent = addSpy.mock.calls[0]![1]
      revokeBeforeUnload()

      expect(removeSpy).toHaveBeenCalledWith('beforeunload', beforeUnloadEvent, undefined)
    })
  })

  describe('mounted/unmounted', () => {
    it('initializes beforeunload on mounted', () => {
      const addSpy = vi.spyOn(window, 'addEventListener')

      const TestComponent = defineComponent({
        setup() {
          useFilingTaskGuards([])
        },
        template: '<div></div>'
      })

      mount(TestComponent)

      expect(addSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function), undefined)
    })

    it('removes beforeunload on unmounted', () => {
      const removeSpy = vi.spyOn(window, 'removeEventListener')

      const TestComponent = defineComponent({
        setup() {
          useFilingTaskGuards([])
        },
        template: '<div></div>'
      })

      const wrapper = mount(TestComponent)

      expect(removeSpy).not.toHaveBeenCalled()

      wrapper.unmount()

      expect(removeSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function), undefined)
    })
  })
})
