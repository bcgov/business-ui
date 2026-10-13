/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { useFilingPage } from '#business/app/composables/useFilingPage'

const identifier = 'BC1234567'

const mockRoute = reactive({
  params: { businessId: identifier } as Record<string, string>,
  query: {} as Record<string, string>
})
mockNuxtImport('useRoute', () => () => mockRoute)

const mockUrlParams = reactive<Record<string, unknown>>({})
mockNuxtImport('useUrlSearchParams', () => () => mockUrlParams)

const { mockNavigateTo } = vi.hoisted(() => ({ mockNavigateTo: vi.fn() }))
mockNuxtImport('navigateTo', () => mockNavigateTo)

// NB: hoisted - @nuxt/icon calls useHead while its module initializes
const { mockHead } = vi.hoisted(() => ({ mockHead: vi.fn() }))
mockNuxtImport('useHead', () => mockHead)

const mockOpenSaveFilingErrorModal = vi.fn()
mockNuxtImport('useFilingModals', () => () => ({
  openSaveFilingErrorModal: mockOpenSaveFilingErrorModal
}))

const mockHandleButtonLoading = vi.fn()
const mockSetAlertText = vi.fn()
mockNuxtImport('useConnectButtonControl', () => () => ({
  handleButtonLoading: mockHandleButtonLoading,
  setAlertText: mockSetAlertText
}))

const mockFilingNavigation = vi.fn()
mockNuxtImport('useFilingNavigation', () => (label?: string) => {
  mockFilingNavigation(label)
  return {
    breadcrumbs: computed(() => [{ label }]),
    dashboardUrl: computed(() => 'http://dashboard/BC1234567')
  }
})

const guards = {
  hasChanges: ref(false),
  canSubmit: vi.fn(() => true),
  canSave: vi.fn(() => true),
  canCancel: vi.fn(() => true),
  initBeforeUnload: vi.fn(),
  revokeBeforeUnload: vi.fn()
}
const mockTaskGuards = vi.fn()
mockNuxtImport('useFilingTaskGuards', () => (watchers: any, submitCondition: any) => {
  mockTaskGuards(watchers, submitCondition)
  return guards
})

let watcherOptions: any
mockNuxtImport('useFilingPageWatcher', () => (options: any) => {
  watcherOptions = options
  return { currentStep: ref(1), nextStep: vi.fn(), previousStep: vi.fn() }
})

const store = {
  init: vi.fn(),
  submit: vi.fn()
}

function getOptions(overrides: Record<string, unknown> = {}) {
  return {
    store,
    filingType: FilingType.CHANGE_OF_DIRECTORS,
    formId: 'director-change-filing',
    i18nPrefix: 'page.changeOfDirectors',
    watchers: [],
    ...overrides
  } as any
}

describe('useFilingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    watcherOptions = undefined
    mockRoute.params = { businessId: identifier }
    mockRoute.query = {}
    mockUrlParams.draft = undefined
    guards.canSubmit.mockReturnValue(true)
    guards.canSave.mockReturnValue(true)
    guards.canCancel.mockReturnValue(true)
  })

  describe('filingText', () => {
    it('resolves desc/h1/title from the i18n prefix', () => {
      const { filingText } = useFilingPage(getOptions({ i18nPrefix: 'text.filingPrefix' }))

      expect(filingText.value).toEqual({
        desc: 'text.filingPrefix.desc',
        h1: 'text.filingPrefix.h1',
        title: 'text.filingPrefix.title'
      })
    })

    it('uses the h1 override and keeps it reactive', () => {
      const year = ref(2025)
      const { filingText } = useFilingPage(getOptions({ h1: () => `Annual Report ${year.value}` }))

      expect(filingText.value.h1).toBe('Annual Report 2025')

      year.value = 2026
      expect(filingText.value.h1).toBe('Annual Report 2026')
    })

    it('sets the page title and the breadcrumb label', () => {
      useFilingPage(getOptions({ h1: 'Change of Directors' }))

      expect(mockHead).toHaveBeenCalledWith({ title: 'page.changeOfDirectors.title' })
      expect(mockFilingNavigation).toHaveBeenCalledWith('Change of Directors')
    })
  })

  describe('draftId', () => {
    it('reads the draft id from the url params by default', () => {
      mockUrlParams.draft = '123'
      const { draftId } = useFilingPage(getOptions())

      expect(draftId).toBe('123')
      expect(watcherOptions.draftId).toBe('123')
    })

    it('reads the draft id from the filingId route param', () => {
      mockRoute.params = { businessId: identifier, filingId: '456' }
      const { draftId } = useFilingPage(getOptions({ draftIdSource: 'route-param' }))

      expect(draftId).toBe('456')
      expect(watcherOptions.draftId).toBe('456')
    })
  })

  describe('watcher wiring', () => {
    it('passes the store, business id, filing type and form id', () => {
      useFilingPage(getOptions({ filingSubType: 'voluntary' }))

      expect(watcherOptions.store).toBe(store)
      expect(watcherOptions.businessId).toBe(identifier)
      expect(watcherOptions.filingType).toBe(FilingType.CHANGE_OF_DIRECTORS)
      expect(watcherOptions.filingSubType).toBe('voluntary')
      expect(watcherOptions.submitFiling).toEqual({ form: 'director-change-filing' })
      expect(watcherOptions.saveFiling).toEqual({ onClick: expect.any(Function) })
      expect(watcherOptions.cancelFiling).toEqual({ onClick: expect.any(Function) })
    })

    it('passes the step and button layout overrides through', () => {
      const steps = [{}, {}]
      useFilingPage(getOptions({
        watcher: { steps, buttonLayout: 'stackedDefault', backButton: null }
      }))

      expect(watcherOptions.steps).toBe(steps)
      expect(watcherOptions.buttonLayout).toBe('stackedDefault')
      expect(watcherOptions.backButton).toBeNull()
    })

    it('saves a draft before the session expires', async () => {
      useFilingPage(getOptions())
      await watcherOptions.setOnBeforeSessionExpired()

      expect(store.submit).toHaveBeenCalledWith(false)
    })

    it('forwards the watchers and submit condition to the task guards', () => {
      const watchers = [[{ a: 1 }, { a: 2 }]]
      const submitCondition = () => true
      useFilingPage(getOptions({ watchers, submitCondition }))

      expect(mockTaskGuards).toHaveBeenCalledWith(watchers, submitCondition)
    })
  })

  describe('saveEnabled', () => {
    it('removes the save button and the session expiry save', async () => {
      const { saveFiling } = useFilingPage(getOptions({ saveEnabled: false }))

      expect(saveFiling).toBeUndefined()
      expect(watcherOptions.saveFiling).toBeNull()

      await watcherOptions.setOnBeforeSessionExpired()

      expect(store.submit).not.toHaveBeenCalled()
    })
  })

  describe('submitFiling', () => {
    it('submits, revokes the unload prompt and returns to the dashboard', async () => {
      const { submitFiling } = useFilingPage(getOptions())

      await submitFiling()

      expect(mockSetAlertText).toHaveBeenCalledWith(undefined)
      expect(mockHandleButtonLoading).toHaveBeenCalledWith(true, 'right', 1)
      expect(store.submit).toHaveBeenCalledWith(true)
      expect(guards.revokeBeforeUnload).toHaveBeenCalled()
      expect(mockNavigateTo).toHaveBeenCalledWith('http://dashboard/BC1234567', { external: true })
    })

    it('blocks the submit with an alert when there are no changes', async () => {
      guards.canSubmit.mockReturnValue(false)
      const { submitFiling } = useFilingPage(getOptions())

      await submitFiling()

      expect(mockSetAlertText).toHaveBeenCalledWith('There are no changes to submit.', 'right')
      expect(store.submit).not.toHaveBeenCalled()
    })

    it('blocks the submit without an alert when the guard is silent', async () => {
      guards.canSubmit.mockReturnValue(false)
      const { submitFiling } = useFilingPage(getOptions({ submitGuard: 'silent' }))

      await submitFiling()

      expect(mockSetAlertText).toHaveBeenCalledExactlyOnceWith(undefined)
      expect(store.submit).not.toHaveBeenCalled()
    })

    it('skips the change check when the guard is none', async () => {
      guards.canSubmit.mockReturnValue(false)
      const { submitFiling } = useFilingPage(getOptions({ submitGuard: 'none' }))

      await submitFiling()

      expect(guards.canSubmit).not.toHaveBeenCalled()
      expect(store.submit).toHaveBeenCalledWith(true)
    })

    it('blocks the submit when an open sub form must be finished first', async () => {
      const preTaskGuard = vi.fn(() => true)
      const { submitFiling } = useFilingPage(getOptions({ preTaskGuard }))

      await submitFiling()

      expect(preTaskGuard).toHaveBeenCalledWith('submit')
      expect(store.submit).not.toHaveBeenCalled()
    })

    it('stashes the draft id the failed submit saved and opens the error modal', async () => {
      const error = { response: { _data: { filing: { header: { filingId: 789 } } } } }
      store.submit.mockRejectedValueOnce(error)
      const { submitFiling } = useFilingPage(getOptions())

      await submitFiling()

      expect(mockUrlParams.draft).toBe('789')
      expect(mockOpenSaveFilingErrorModal).toHaveBeenCalledWith(error, false)
      expect(mockHandleButtonLoading).toHaveBeenLastCalledWith(false)
      expect(guards.initBeforeUnload).toHaveBeenCalled()
      expect(mockNavigateTo).not.toHaveBeenCalled()
    })

    it('prefers the api error message when configured', async () => {
      const error = new Error('rejected')
      store.submit.mockRejectedValueOnce(error)
      const { submitFiling } = useFilingPage(getOptions({ preferApiMessageOnError: true }))

      await submitFiling()

      expect(mockOpenSaveFilingErrorModal).toHaveBeenCalledWith(error, true)
    })

    it('does not stash a draft id for a pre-created draft', async () => {
      mockRoute.params = { businessId: identifier, filingId: '456' }
      store.submit.mockRejectedValueOnce(new Error('rejected'))
      const { submitFiling } = useFilingPage(getOptions({ draftIdSource: 'route-param' }))

      await submitFiling()

      expect(mockUrlParams.draft).toBeUndefined()
      expect(mockOpenSaveFilingErrorModal).toHaveBeenCalled()
    })
  })

  describe('saveFiling', () => {
    it('saves a draft and returns to the dashboard', async () => {
      const { saveFiling } = useFilingPage(getOptions())

      await saveFiling!()

      expect(store.submit).toHaveBeenCalledWith(false)
      expect(guards.revokeBeforeUnload).toHaveBeenCalled()
      expect(mockNavigateTo).toHaveBeenCalledWith('http://dashboard/BC1234567', { external: true })
    })

    it('blocks the save with an alert when there are no changes', async () => {
      guards.canSave.mockReturnValue(false)
      const { saveFiling } = useFilingPage(getOptions())

      await saveFiling!()

      expect(mockSetAlertText).toHaveBeenCalledWith('There are no changes to save.', 'left')
      expect(store.submit).not.toHaveBeenCalled()
    })

    it('blocks the save when an open sub form must be finished first', async () => {
      const preTaskGuard = vi.fn(() => true)
      const { saveFiling } = useFilingPage(getOptions({ preTaskGuard }))

      await saveFiling!()

      expect(preTaskGuard).toHaveBeenCalledWith('save')
      expect(store.submit).not.toHaveBeenCalled()
    })

    it('bypasses the guards and the error modal when the unsaved changes block is off', async () => {
      guards.canSave.mockReturnValue(false)
      const preTaskGuard = vi.fn(() => true)
      store.submit.mockRejectedValueOnce(new Error('rejected'))
      const { saveFiling } = useFilingPage(getOptions({ preTaskGuard }))

      await saveFiling!(false)

      expect(preTaskGuard).not.toHaveBeenCalled()
      expect(store.submit).toHaveBeenCalledWith(false)
      expect(mockOpenSaveFilingErrorModal).not.toHaveBeenCalled()
    })

    it('opens the error modal when the save fails', async () => {
      const error = new Error('rejected')
      store.submit.mockRejectedValueOnce(error)
      const { saveFiling } = useFilingPage(getOptions())

      await saveFiling!()

      expect(mockOpenSaveFilingErrorModal).toHaveBeenCalledWith(error, false)
      expect(guards.initBeforeUnload).toHaveBeenCalled()
      expect(mockUrlParams.draft).toBeUndefined()
    })
  })

  describe('cancelFiling', () => {
    it('returns to the dashboard when there are no unsaved changes', async () => {
      const { cancelFiling } = useFilingPage(getOptions())

      await cancelFiling()

      expect(mockNavigateTo).toHaveBeenCalledWith('http://dashboard/BC1234567', { external: true })
    })

    it('stays on the page when the unsaved changes modal takes over', async () => {
      guards.canCancel.mockReturnValue(false)
      const { cancelFiling } = useFilingPage(getOptions())

      await cancelFiling()

      expect(mockNavigateTo).not.toHaveBeenCalled()
    })
  })

  describe('onError', () => {
    it('focuses the staff payment fieldset when the payment option is invalid', () => {
      const setFocusOnError = vi.fn()
      const staffPayRef = shallowRef({ setFocusOnError }) as any
      const { onError } = useFilingPage(getOptions({ staffPayRef }))

      onError({ errors: [{ name: 'staffPayment.option' }] } as any)

      expect(setFocusOnError).toHaveBeenCalled()
    })

    it('falls back to the form error handler', () => {
      const setFocusOnError = vi.fn()
      const staffPayRef = shallowRef({ setFocusOnError }) as any
      const { onError } = useFilingPage(getOptions({ staffPayRef }))

      onError({ errors: [{ id: 'folio', name: 'folio.folioNumber' }] } as any)

      expect(setFocusOnError).not.toHaveBeenCalled()
    })
  })
})
