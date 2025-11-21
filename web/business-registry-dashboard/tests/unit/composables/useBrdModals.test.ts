import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const mockOpenModal = vi.fn()
const mockCloseModal = vi.fn()
mockNuxtImport('useModal', () => {
  return () => (
    {
      open: mockOpenModal,
      close: mockCloseModal
    }
  )
})

mockNuxtImport('useNuxtApp', () => {
  return () => (
    {
      $i18n: {
        t: (key: string) => key,
        locale: { value: 'en-CA' }
      }
    }
  )
})

describe('useBrdModals', () => {
  let brdModal: ReturnType<typeof useBrdModals>

  beforeEach(() => {
    brdModal = useBrdModals()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
    vi.resetAllMocks()
  })

  describe('openManageNameRequest', () => {
    it('should open ModalManageNameRequest with correct props', () => {
      const nr = { names: ['Test Name'], nrNum: 'NR123' }
      brdModal.openManageNameRequest(nr)

      const callArgs = mockOpenModal.mock.calls[0]

      const modalComponent = callArgs[0]
      const modalProps = callArgs[1]

      expect(modalComponent.__name).toBe('ManageNameRequest')
      expect(modalProps).toEqual(
        expect.objectContaining({
          nameRequest: {
            names: ['Test Name'],
            nrNum: 'NR123'
          }
        }))
    })
  })

  describe('openManageNRError', () => {
    it('should open ModalBase with correct props', () => {
      brdModal.openManageNRError()

      const callArgs = mockOpenModal.mock.calls[0]

      const modalComponent = callArgs[0]
      const modalProps = callArgs[1]

      expect(modalComponent.__name).toBe('Base')
      expect(modalProps).toEqual(
        expect.objectContaining({
          actions: [{
            handler: expect.any(Function),
            label: 'btn.close'
          }],
          error: {
            description: 'form.manageNR.error.default.description',
            title: 'form.manageNR.error.default.title'
          }
        }))
    })
  })

  describe('openBusinessAddError', () => {
    it('should open ModalBase with correct props', () => {
      brdModal.openBusinessAddError()

      const callArgs = mockOpenModal.mock.calls[0]

      const modalComponent = callArgs[0]
      const modalProps = callArgs[1]

      expect(modalComponent.__name).toBe('Base')
      expect(modalProps).toEqual(
        expect.objectContaining({
          actions: [{
            handler: expect.any(Function),
            label: 'btn.close'
          }],
          error: {
            description: 'error.businessAdd.description',
            title: 'error.businessAdd.title'
          }
        }))
    })
  })

  describe('openBusinessUnavailableError', () => {
    it('should open ModalBase with correct props when action is change name', () => {
      const action = 'change name'
      brdModal.openBusinessUnavailableError(action)

      const callArgs = mockOpenModal.mock.calls[0]

      const modalComponent = callArgs[0]
      const modalProps = callArgs[1]

      expect(modalComponent.__name).toBe('Base')
      expect(modalProps).toEqual(
        expect.objectContaining({
          actions: [{
            handler: expect.any(Function),
            label: 'btn.ok'
          }],
          error: {
            description: 'error.businessUnavailable.changeName.description',
            title: 'error.businessUnavailable.changeName.title',
            showContactInfo: true
          }
        }))
    })

    it('should open ModalBase with correct props when action is not change name', () => {
      const action = 'restore'
      brdModal.openBusinessUnavailableError(action)

      const callArgs = mockOpenModal.mock.calls[0]

      const modalComponent = callArgs[0]
      const modalProps = callArgs[1]

      expect(modalComponent.__name).toBe('Base')
      expect(modalProps).toEqual(
        expect.objectContaining({
          actions: [{
            handler: expect.any(Function),
            label: 'btn.ok'
          }],
          error: {
            description: 'error.businessUnavailable.generic.description',
            title: 'error.businessUnavailable.generic.title',
            showContactInfo: true
          }
        }))
    })
  })

  /* There are two types of modals available, generic and passcode.
     The passcode type model is only used for COOPs.
  */
  describe('openBusinessRemovalConfirmation', () => {
  /* Testing that the generic Modal is used.

    This should show for anything that is included in the CorpTypes enum
    - i.e bootstrap filings, societies and business types (other than COOPS).
    Because it is the current default, it will show as long as it receives a string.
  */
    it('should open ModalRemoveBusiness for generic type', () => {
      [CorpTypes.NAME_REQUEST,
        CorpTypes.INCORPORATION_APPLICATION,
        CorpTypes.AMALGAMATION_APPLICATION,
        CorpTypes.REGISTRATION,
        CorpTypes.PARTNERSHIP,
        CorpTypes.SOLE_PROP,
        CorpTypes.CONTINUE_IN,
        'future types' // Future types will automatically get generic module rather than passcode
      ].forEach((item) => {
        const payload = {
          business: { corpType: { code: item } }
        }

        // @ts-expect-error - payload arg doesnt match function param
        brdModal.openBusinessRemovalConfirmation(payload)

        const callArgs = mockOpenModal.mock.calls[0]

        // const modalComponent = callArgs[0]
        const modalProps = callArgs[1]

        // expect(modalComponent.__name).toBe('RemoveBusiness') // TODO: why is this returning index instead of RemoveBusiness
        expect(modalProps).toEqual(
          expect.objectContaining({
            removeBusinessPayload: {
              business: {
                corpType: {
                  code: item
                }
              }
            },
            type: 'generic'
          })
        )

        vi.clearAllMocks()
        vi.restoreAllMocks()
      })
    })

    /* Testing that the passcode Modal is used.
      This should show for COOPS only. */
    it('should open ModalRemoveBusiness for passcode type', () => {
      const payload = {
        business: { corpType: { code: CorpTypes.COOP } }
      }

      // @ts-expect-error - payload arg doesnt match function param
      brdModal.openBusinessRemovalConfirmation(payload)

      const callArgs = mockOpenModal.mock.calls[0]

      // const modalComponent = callArgs[0]
      const modalProps = callArgs[1]

      // expect(modalComponent.__name).toBe('RemoveBusiness') // TODO: why is this returning index instead of RemoveBusiness
      expect(modalProps).toEqual(
        expect.objectContaining({
          removeBusinessPayload: {
            business: {
              corpType: {
                code: 'CP'
              }
            }
          },
          type: 'passcode'
        })
      )
    })
  })

  describe('close', () => {
    it('should call the close method', () => {
      brdModal.close()

      expect(mockCloseModal).toHaveBeenCalledOnce()
    })
  })
})
