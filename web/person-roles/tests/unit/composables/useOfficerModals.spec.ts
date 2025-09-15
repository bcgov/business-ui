import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

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

mockNuxtImport('useRoute', () => () => ({
  params: { businessId: 'BC1234567' }
}))

mockNuxtImport('useRuntimeConfig', () => () => ({
  public: {
    businessDashboardUrl: 'http://business-dashboard-example/',
    brdUrl: 'http://brd-example/'
  }
}))

mockNuxtImport('useConnectAccountStore', () => () => ({
  currentAccount: { id: 'test-account-id' }
}))

describe('useOfficerModals', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('openUnsavedChangesModal', () => {
    it('should open the base modal with correct titles and buttons', async () => {
      const { openUnsavedChangesModal } = useOfficerModals()
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

    it('should call revoke event and navigate when "Exit" button is clicked', async () => {
      const { openUnsavedChangesModal } = useOfficerModals()
      const mockRevokeEvent = vi.fn()

      await openUnsavedChangesModal(mockRevokeEvent)

      // Get the onClick function from the button passed to the mock
      const exitButtonOnClick = mockBaseModalOpen.mock.calls[0]![0].buttons[1].onClick
      await exitButtonOnClick()

      // Assert that the side effects happened
      expect(mockRevokeEvent).toHaveBeenCalledOnce()
      expect(mockNavigateTo).toHaveBeenCalledOnce()
      expect(mockNavigateTo).toHaveBeenCalledWith(
        'http://business-dashboard-example/BC1234567?accountid=test-account-id', { external: true }
      )
    })
  })

  describe('openPendingTaskOnSaveOrSubmitModal', () => {
    it('should open the error modal with the correct prefix', async () => {
      const { openPendingTaskOnSaveOrSubmitModal } = useOfficerModals()
      await openPendingTaskOnSaveOrSubmitModal()

      expect(mockErrorModalOpen).toHaveBeenCalledOnce()
      expect(mockErrorModalOpen).toHaveBeenCalledWith(
        expect.objectContaining({ i18nPrefix: 'modal.error.pendingTaskOnSaveOrSubmit' })
      )
    })
  })

  describe('openSaveFilingErrorModal', () => {
    it('should open the error modal with the correct prefix and error object', async () => {
      const { openSaveFilingErrorModal } = useOfficerModals()
      const mockError = new Error('API Failed')
      await openSaveFilingErrorModal(mockError)

      expect(mockErrorModalOpen).toHaveBeenCalledOnce()
      expect(mockErrorModalOpen).toHaveBeenCalledWith(
        expect.objectContaining({
          error: mockError,
          i18nPrefix: 'modal.error.submitFiling'
        })
      )
    })
  })

  describe('openFilingNotAllowedErrorModal', () => {
    it('should open the error modal with the correct buttons and prefix', async () => {
      const { openFilingNotAllowedErrorModal } = useOfficerModals()
      await openFilingNotAllowedErrorModal()

      expect(mockErrorModalOpen).toHaveBeenCalledOnce()
      const callArgs = mockErrorModalOpen.mock.calls[0]![0]
      expect(callArgs.i18nPrefix).toBe('modal.error.filingNotAllowed')
      expect(callArgs.buttons).toHaveLength(2)
      expect(callArgs.buttons[0].label).toBe('Go Back')
      expect(callArgs.buttons[0].to).toBe('http://business-dashboard-example/BC1234567?accountid=test-account-id')
      expect(callArgs.buttons[1].label).toBe('Refresh Page')
    })
  })

  describe('openGetDraftFilingErrorModal', () => {
    it('should open the error modal with the correct buttons and prefix', async () => {
      const { openGetDraftFilingErrorModal } = useOfficerModals()
      await openGetDraftFilingErrorModal(new Error('Draft not found'))

      expect(mockErrorModalOpen).toHaveBeenCalledOnce()
      const callArgs = mockErrorModalOpen.mock.calls[0]![0]
      expect(callArgs.i18nPrefix).toBe('modal.error.getDraftFiling')
      expect(callArgs.buttons).toHaveLength(2)
      expect(callArgs.buttons[0].label).toBe('Go Back')
      expect(callArgs.buttons[0].to).toBe('http://business-dashboard-example/BC1234567?accountid=test-account-id')
      expect(callArgs.buttons[1].label).toBe('Refresh Page')
    })
  })

  describe('openInitOfficerStoreErrorModal', () => {
    it('should show "Go to My Business Registry" button for a 404 error', async () => {
      const { openInitOfficerStoreErrorModal } = useOfficerModals()
      const mockError = { statusCode: 404, message: 'Not Found' }
      await openInitOfficerStoreErrorModal(mockError)

      expect(mockErrorModalOpen).toHaveBeenCalledOnce()
      const callArgs = mockErrorModalOpen.mock.calls[0]![0]
      expect(callArgs.i18nPrefix).toBe('modal.error.initOfficerStore')
      expect(callArgs.buttons).toHaveLength(1)
      expect(callArgs.buttons[0].label).toBe('Go to My Business Registry')
      expect(callArgs.buttons[0].to).toBe('http://brd-example/account/test-account-id')
    })

    it('should show "Go to My Business Registry" button for a 401 error', async () => {
      const { openInitOfficerStoreErrorModal } = useOfficerModals()
      const mockError = { statusCode: 401, message: 'Unauthorized' }
      await openInitOfficerStoreErrorModal(mockError)

      expect(mockErrorModalOpen).toHaveBeenCalledOnce()
      const callArgs = mockErrorModalOpen.mock.calls[0]![0]
      expect(callArgs.buttons).toHaveLength(1)
      expect(callArgs.buttons[0].label).toBe('Go to My Business Registry')
      expect(callArgs.buttons[0].to).toBe('http://brd-example/account/test-account-id')
    })

    it('should show "Go to My Business Registry" button for a 403 error', async () => {
      const { openInitOfficerStoreErrorModal } = useOfficerModals()
      const mockError = { statusCode: 403, message: 'Forbidden' }
      await openInitOfficerStoreErrorModal(mockError)

      expect(mockErrorModalOpen).toHaveBeenCalledOnce()
      const callArgs = mockErrorModalOpen.mock.calls[0]![0]
      expect(callArgs.buttons).toHaveLength(1)
      expect(callArgs.buttons[0].label).toBe('Go to My Business Registry')
      expect(callArgs.buttons[0].to).toBe('http://brd-example/account/test-account-id')
    })

    it('should show "Go Back" and "Refresh" buttons for a 500 error', async () => {
      const { openInitOfficerStoreErrorModal } = useOfficerModals()
      const mockError = { statusCode: 500, message: 'Server Error' }
      await openInitOfficerStoreErrorModal(mockError)

      expect(mockErrorModalOpen).toHaveBeenCalledOnce()
      const callArgs = mockErrorModalOpen.mock.calls[0]![0]
      expect(callArgs.i18nPrefix).toBe('modal.error.initOfficerStore')
      expect(callArgs.buttons).toHaveLength(2)
      expect(callArgs.buttons[0].label).toBe('Go Back')
      expect(callArgs.buttons[0].to).toBe('http://business-dashboard-example/BC1234567?accountid=test-account-id')
      expect(callArgs.buttons[1].label).toBe('Refresh Page')
    })

    it('should show "Go Back" and "Refresh" buttons for an unknown error', async () => {
      const { openInitOfficerStoreErrorModal } = useOfficerModals()
      const mockError = new Error('Network Failed') // An error without a statusCode
      await openInitOfficerStoreErrorModal(mockError)

      expect(mockErrorModalOpen).toHaveBeenCalledOnce()
      const callArgs = mockErrorModalOpen.mock.calls[0]![0]
      expect(callArgs.buttons).toHaveLength(2)
      expect(callArgs.buttons[0].label).toBe('Go Back')
      expect(callArgs.buttons[0].to).toBe('http://business-dashboard-example/BC1234567?accountid=test-account-id')
    })
  })
})
