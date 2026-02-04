import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const identifier = 'BC1234567'

const mockBaseModalOpen = vi.fn()
const mockErrorModalOpen = vi.fn()
mockNuxtImport('useModal', () => {
  return () => ({
    baseModal: { open: mockBaseModalOpen },
    errorModal: { open: mockErrorModalOpen }
  })
})

const { mockNavigateTo } = vi.hoisted(() => ({ mockNavigateTo: vi.fn() }))
mockNuxtImport('navigateTo', () => mockNavigateTo)

const mockRoute = reactive({
  params: { businessId: identifier },
  query: {} as { draft?: string }
})
mockNuxtImport('useRoute', () => () => mockRoute)

mockNuxtImport('useRuntimeConfig', () => () => ({
  public: {
    businessDashboardUrl: 'http://business-dashboard-example/',
    brdUrl: 'http://brd-example/',
    businessEditUrl: 'http://business-edit/'
  }
}))

mockNuxtImport('useConnectAccountStore', () => () => ({
  currentAccount: { id: 'test-account-id' }
}))

describe('useFilingModals', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRoute.query = {}
  })

  describe('openUnsavedChangesModal', () => {
    it('should open the base modal with correct titles and buttons', async () => {
      const { openUnsavedChangesModal } = useFilingModals()
      const mockRevokeEvent = vi.fn()

      await openUnsavedChangesModal(mockRevokeEvent)

      expect(mockBaseModalOpen).toHaveBeenCalledOnce()
      const callArgs = mockBaseModalOpen.mock.calls[0]![0]
      expect(callArgs.title).toBe('Unsaved changes')
      expect(callArgs.description).toBe('You have unsaved changes. Are you sure you want to exit your filing?')
      expect(callArgs.buttons).toHaveLength(2)
      expect(callArgs.buttons[0].label).toBe('Keep Editing')
      expect(callArgs.buttons[1].label).toBe('Exit Without Saving')
    })

    describe('When draft is NOT present', () => {
      it('should call revoke event and navigate to business edit when "Exit" button is clicked', async () => {
        const { openUnsavedChangesModal } = useFilingModals()
        const mockRevokeEvent = vi.fn()

        await openUnsavedChangesModal(mockRevokeEvent)

        const exitButtonOnClick = mockBaseModalOpen.mock.calls[0]![0].buttons[1].onClick
        await exitButtonOnClick()

        expect(mockRevokeEvent).toHaveBeenCalledOnce()
        expect(mockNavigateTo).toHaveBeenCalledOnce()
        expect(mockNavigateTo).toHaveBeenCalledWith(
          'http://business-edit/BC1234567/alteration?accountid=test-account-id', { external: true }
        )
      })
    })

    describe('When draft is present', () => {
      beforeEach(() => {
        mockRoute.query = { draft: '12345' }
      })

      it('should call revoke event and navigate to business dashboard when "Exit" button is clicked', async () => {
        const { openUnsavedChangesModal } = useFilingModals()
        const mockRevokeEvent = vi.fn()

        await openUnsavedChangesModal(mockRevokeEvent)

        const exitButtonOnClick = mockBaseModalOpen.mock.calls[0]![0].buttons[1].onClick
        await exitButtonOnClick()

        expect(mockRevokeEvent).toHaveBeenCalledOnce()
        expect(mockNavigateTo).toHaveBeenCalledOnce()
        expect(mockNavigateTo).toHaveBeenCalledWith(
          'http://business-dashboard-example/BC1234567?accountid=test-account-id', { external: true }
        )
      })
    })
  })

  describe('openPendingTaskOnSaveOrSubmitModal', () => {
    it('should open the error modal with the correct prefix', async () => {
      const { openPendingTaskOnSaveOrSubmitModal } = useFilingModals()
      await openPendingTaskOnSaveOrSubmitModal()

      expect(mockErrorModalOpen).toHaveBeenCalledOnce()
      expect(mockErrorModalOpen).toHaveBeenCalledWith(
        expect.objectContaining({ i18nPrefix: 'modal.error.filing.pendingTaskOnSaveOrSubmit' })
      )
    })
  })

  describe('openSaveFilingErrorModal', () => {
    it('should open the error modal with the correct prefix, error object and default preferErrorMessage', async () => {
      const { openSaveFilingErrorModal } = useFilingModals()
      const mockError = new Error('API Failed')
      await openSaveFilingErrorModal(mockError)

      expect(mockErrorModalOpen).toHaveBeenCalledOnce()
      expect(mockErrorModalOpen).toHaveBeenCalledWith(
        expect.objectContaining({
          error: mockError,
          i18nPrefix: 'modal.error.filing.submit',
          preferErrorMessage: false
        })
      )
    })

    it('should pass preferErrorMessage as true when preferApiMessage is true', async () => {
      const { openSaveFilingErrorModal } = useFilingModals()
      const mockError = new Error('API Failed')

      await openSaveFilingErrorModal(mockError, true)

      expect(mockErrorModalOpen).toHaveBeenCalledWith(
        expect.objectContaining({
          preferErrorMessage: true
        })
      )
    })
  })

  describe('openFilingNotAllowedErrorModal', () => {
    describe('When draft is NOT present', () => {
      it('should open the error modal with the correct buttons and prefix', async () => {
        const { openFilingNotAllowedErrorModal } = useFilingModals()
        await openFilingNotAllowedErrorModal()

        expect(mockErrorModalOpen).toHaveBeenCalledOnce()
        const callArgs = mockErrorModalOpen.mock.calls[0]![0]
        expect(callArgs.i18nPrefix).toBe('modal.error.filing.notAllowed')
        expect(callArgs.buttons).toHaveLength(2)
        expect(callArgs.buttons[0].label).toBe('Go Back')
        expect(callArgs.buttons[0].to).toBe('http://business-edit/BC1234567/alteration?accountid=test-account-id')
        expect(callArgs.buttons[1].label).toBe('Refresh Page')
      })
    })

    describe('When draft is present', () => {
      beforeEach(() => {
        mockRoute.query = { draft: '12345' }
      })

      it('should open the error modal with the correct buttons and prefix', async () => {
        const { openFilingNotAllowedErrorModal } = useFilingModals()
        await openFilingNotAllowedErrorModal()

        expect(mockErrorModalOpen).toHaveBeenCalledOnce()
        const callArgs = mockErrorModalOpen.mock.calls[0]![0]
        expect(callArgs.i18nPrefix).toBe('modal.error.filing.notAllowed')
        expect(callArgs.buttons).toHaveLength(2)
        expect(callArgs.buttons[0].label).toBe('Go Back')
        expect(callArgs.buttons[0].to).toBe('http://business-dashboard-example/BC1234567?accountid=test-account-id')
        expect(callArgs.buttons[1].label).toBe('Refresh Page')
      })
    })
  })

  describe('openGetDraftFilingErrorModal', () => {
    it('should open the error modal with the correct buttons and prefix', async () => {
      const { openGetDraftFilingErrorModal } = useFilingModals()
      await openGetDraftFilingErrorModal(new Error('Draft not found'))

      expect(mockErrorModalOpen).toHaveBeenCalledOnce()
      const callArgs = mockErrorModalOpen.mock.calls[0]![0]
      expect(callArgs.i18nPrefix).toBe('modal.error.filing.getDraft')
      expect(callArgs.buttons).toHaveLength(2)
      expect(callArgs.buttons[0].label).toBe('Go Back')
      expect(callArgs.buttons[0].to).toBe('http://business-dashboard-example/BC1234567?accountid=test-account-id')
      expect(callArgs.buttons[1].label).toBe('Refresh Page')
    })
  })

  describe('openInitFilingErrorModal', () => {
    it('should show "Go to My Business Registry" button for a 404 error', async () => {
      const { openInitFilingErrorModal } = useFilingModals()
      const mockError = { statusCode: 404, message: 'Not Found' }
      await openInitFilingErrorModal(mockError)

      expect(mockErrorModalOpen).toHaveBeenCalledOnce()
      const callArgs = mockErrorModalOpen.mock.calls[0]![0]
      expect(callArgs.i18nPrefix).toBe('modal.error.filing.init')
      expect(callArgs.buttons).toHaveLength(1)
      expect(callArgs.buttons[0].label).toBe('Go to My Business Registry')
      expect(callArgs.buttons[0].to).toBe('http://brd-example/account/test-account-id')
    })

    it('should show "Go to My Business Registry" button for a 401 error', async () => {
      const { openInitFilingErrorModal } = useFilingModals()
      const mockError = { statusCode: 401, message: 'Unauthorized' }
      await openInitFilingErrorModal(mockError)

      expect(mockErrorModalOpen).toHaveBeenCalledOnce()
      const callArgs = mockErrorModalOpen.mock.calls[0]![0]
      expect(callArgs.buttons).toHaveLength(1)
      expect(callArgs.buttons[0].label).toBe('Go to My Business Registry')
      expect(callArgs.buttons[0].to).toBe('http://brd-example/account/test-account-id')
    })

    it('should show "Go to My Business Registry" button for a 403 error', async () => {
      const { openInitFilingErrorModal } = useFilingModals()
      const mockError = { statusCode: 403, message: 'Forbidden' }
      await openInitFilingErrorModal(mockError)

      expect(mockErrorModalOpen).toHaveBeenCalledOnce()
      const callArgs = mockErrorModalOpen.mock.calls[0]![0]
      expect(callArgs.buttons).toHaveLength(1)
      expect(callArgs.buttons[0].label).toBe('Go to My Business Registry')
      expect(callArgs.buttons[0].to).toBe('http://brd-example/account/test-account-id')
    })

    describe('When draft is NOT present', () => {
      it('should show "Go Back" and "Refresh" buttons for a 500 error', async () => {
        const { openInitFilingErrorModal } = useFilingModals()
        const mockError = { statusCode: 500, message: 'Server Error' }
        await openInitFilingErrorModal(mockError)

        expect(mockErrorModalOpen).toHaveBeenCalledOnce()
        const callArgs = mockErrorModalOpen.mock.calls[0]![0]
        expect(callArgs.i18nPrefix).toBe('modal.error.filing.init')
        expect(callArgs.buttons).toHaveLength(2)
        expect(callArgs.buttons[0].label).toBe('Go Back')
        expect(callArgs.buttons[0].to).toBe('http://business-edit/BC1234567/alteration?accountid=test-account-id')
        expect(callArgs.buttons[1].label).toBe('Refresh Page')
      })

      it('should show "Go Back" and "Refresh" buttons for an unknown error', async () => {
        const { openInitFilingErrorModal } = useFilingModals()
        const mockError = new Error('Network Failed') // An error without a statusCode
        await openInitFilingErrorModal(mockError)

        expect(mockErrorModalOpen).toHaveBeenCalledOnce()
        const callArgs = mockErrorModalOpen.mock.calls[0]![0]
        expect(callArgs.buttons).toHaveLength(2)
        expect(callArgs.buttons[0].label).toBe('Go Back')
        expect(callArgs.buttons[0].to).toBe('http://business-edit/BC1234567/alteration?accountid=test-account-id')
      })
    })

    describe('When draft is present', () => {
      beforeEach(() => {
        mockRoute.query = { draft: '12345' }
      })

      it('should show "Go Back" and "Refresh" buttons for a 500 error', async () => {
        const { openInitFilingErrorModal } = useFilingModals()
        const mockError = { statusCode: 500, message: 'Server Error' }
        await openInitFilingErrorModal(mockError)

        expect(mockErrorModalOpen).toHaveBeenCalledOnce()
        const callArgs = mockErrorModalOpen.mock.calls[0]![0]
        expect(callArgs.i18nPrefix).toBe('modal.error.filing.init')
        expect(callArgs.buttons).toHaveLength(2)
        expect(callArgs.buttons[0].label).toBe('Go Back')
        expect(callArgs.buttons[0].to).toBe('http://business-dashboard-example/BC1234567?accountid=test-account-id')
        expect(callArgs.buttons[1].label).toBe('Refresh Page')
      })

      it('should show "Go Back" and "Refresh" buttons for an unknown error', async () => {
        const { openInitFilingErrorModal } = useFilingModals()
        const mockError = new Error('Network Failed') // An error without a statusCode
        await openInitFilingErrorModal(mockError)

        expect(mockErrorModalOpen).toHaveBeenCalledOnce()
        const callArgs = mockErrorModalOpen.mock.calls[0]![0]
        expect(callArgs.buttons).toHaveLength(2)
        expect(callArgs.buttons[0].label).toBe('Go Back')
        expect(callArgs.buttons[0].to).toBe('http://business-dashboard-example/BC1234567?accountid=test-account-id')
      })
    })
  })

  describe('openFilingNotAvailableModal', () => {
    describe('When draft is NOT present', () => {
      it('should open the base modal with the correct title, description, and button', async () => {
        const { openFilingNotAvailableModal } = useFilingModals()

        await openFilingNotAvailableModal()

        expect(mockBaseModalOpen).toHaveBeenCalledOnce()
        expect(mockErrorModalOpen).not.toHaveBeenCalled()

        const callArgs = mockBaseModalOpen.mock.calls[0]![0]
        expect(callArgs.title).toBe('Page not available')
        // eslint-disable-next-line
        expect(callArgs.description).toBe('This filing is not available for this type of business. If you believe this is an error, please contact support.')
        expect(callArgs.dismissible).toBe(false)

        expect(callArgs.buttons).toHaveLength(1)
        const button = callArgs.buttons[0]
        expect(button.label).toBe('Go Back')
        expect(button.to).toBe('http://business-edit/BC1234567/alteration?accountid=test-account-id')
        expect(button.external).toBe(true)
      })
    })

    describe('When draft is present', () => {
      beforeEach(() => {
        mockRoute.query = { draft: '12345' }
      })

      it('should open the base modal with the correct title, description, and button', async () => {
        const { openFilingNotAvailableModal } = useFilingModals()

        await openFilingNotAvailableModal()

        expect(mockBaseModalOpen).toHaveBeenCalledOnce()
        expect(mockErrorModalOpen).not.toHaveBeenCalled()

        const callArgs = mockBaseModalOpen.mock.calls[0]![0]
        expect(callArgs.title).toBe('Page not available')
        // eslint-disable-next-line
        expect(callArgs.description).toBe('This filing is not available for this type of business. If you believe this is an error, please contact support.')
        expect(callArgs.dismissible).toBe(false)

        expect(callArgs.buttons).toHaveLength(1)
        const button = callArgs.buttons[0]
        expect(button.label).toBe('Go Back')
        expect(button.to).toBe('http://business-dashboard-example/BC1234567?accountid=test-account-id')
        expect(button.external).toBe(true)
      })
    })
  })
})
