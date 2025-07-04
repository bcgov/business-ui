import { describe, test, expect, vi, afterEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { ModalBase, ModalBaseError } from '#components'

const mockModalInstance = {
  open: vi.fn().mockResolvedValue(true),
  close: vi.fn()
}

const mockOverlayCreate = vi.fn(() => mockModalInstance)

mockNuxtImport('useOverlay', () => {
  return () => ({
    create: mockOverlayCreate
  })
})

describe('useModal', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('openBaseModal', () => {
    test('should call overlay.create with the correct component and props', async () => {
      const { openBaseModal } = useModal()

      const title = 'Test Title'
      const description = 'Test Description'
      const buttons = [{ label: 'OK' }]

      await openBaseModal(title, description, false, buttons)

      expect(mockOverlayCreate).toHaveBeenCalledOnce()
      expect(mockOverlayCreate).toHaveBeenCalledWith(ModalBase, expect.any(Object))

      // @ts-expect-error - mock overlay.mock.calls may be undefined
      const propsPassed = mockOverlayCreate.mock.calls[0][1].props
      expect(propsPassed.title).toBe(title)
      expect(propsPassed.description).toBe(description)
      expect(propsPassed.buttons).toEqual(buttons)
    })

    test("should call the returned modal's open method", async () => {
      const { openBaseModal } = useModal()

      await openBaseModal('title', 'desc', false, [])

      expect(mockModalInstance.open).toHaveBeenCalledOnce()
    })
  })

  describe('openBaseErrorModal', () => {
    test('should call overlay.create with the ModalBaseError component', async () => {
      const { openBaseErrorModal } = useModal()
      const error = new Error('Test Error')
      const i18nPrefix = 'test.prefix'

      await openBaseErrorModal(error, i18nPrefix)

      expect(mockOverlayCreate).toHaveBeenCalledWith(ModalBaseError, expect.any(Object))

      // @ts-expect-error - mock overlay.mock.calls may be undefined
      const createCallArgs = (mockOverlayCreate).mock.calls[0][1]
      // @ts-expect-error - mock overlay.mock.calls may be undefined
      expect(createCallArgs.props.error).toBe(error)
      // @ts-expect-error - mock overlay.mock.calls may be undefined
      expect(createCallArgs.props.i18nPrefix).toBe(i18nPrefix)
    })
  })
})
