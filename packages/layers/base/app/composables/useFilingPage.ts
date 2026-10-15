import type { FormErrorEvent } from '@nuxt/ui'
import type { FetchError } from 'ofetch'
import type { ShallowRef } from 'vue'

/** The store contract a filing page drives - `init` matches both useFilingPageWatcher init shapes. */
interface FilingPageStore<T> {
  init:
    | ((businessId: string, draftId?: string) => Promise<void>)
    | ((businessId: string, filingSubType?: T, draftId?: string) => Promise<void>)
  submit: (isSubmission: boolean) => Promise<unknown>
}

/**
 * Blocks save/submit when a sub form is still open (the page sets its own alert).
 * NB: the action is passed through so a page can alert with an action specific message.
 */
type FilingPagePreTaskGuard = (action: 'submit' | 'save') => boolean

/** Button/step passthrough for the underlying useFilingPageWatcher. */
interface FilingPageWatcherOverrides {
  saveFiling?: ConnectButton
  cancelFiling?: ConnectButton
  submitFiling?: ConnectButton
  backButton?: ConnectButton | null
  steps?: Parameters<typeof useFilingPageWatcher>[0]['steps']
  buttonLayout?: 'bottomDefault' | 'stackedDefault'
}

interface FilingPageOptions<T> {
  store: FilingPageStore<T>
  filingType: FilingType
  filingSubType?: T
  /** The UForm id the submit button targets. */
  formId: string
  /** The i18n group holding desc/h1/title, eg 'page.changeOfDirectors'. */
  i18nPrefix: string
  /** Named params the desc/h1/title keys interpolate (eg the annual report year). */
  i18nParams?: MaybeRefOrGetter<Record<string, unknown>>
  /** [initialState, currentState] pairs change detection compares - see useFilingTaskGuards. */
  watchers: Parameters<typeof useFilingTaskGuards>[0]
  /** Replaces the default 'any local change, or a resumed draft' submit rule. */
  submitCondition?: MaybeRefOrGetter<boolean>
  preTaskGuard?: FilingPagePreTaskGuard
  /** The onError focus target - the staff payment option is the one field outside the UForm tree. */
  staffPayRef?: Readonly<ShallowRef<StaffPaymentFieldsetRef | null>>
  /**
   * 'alert' (default) blocks submit with the 'no changes' button alert, 'silent' blocks without one
   * and 'none' skips the check (the filing is submittable with no local changes).
   */
  submitGuard?: 'alert' | 'silent' | 'none'
  /** Shows the api error message instead of the generic one (the backend rejects filing specific state). */
  preferApiMessageOnError?: boolean
  /** 'route-param' = the draft is pre-created and its filing id is the `filingId` route segment. */
  draftIdSource?: 'query' | 'route-param'
  /** false = File and Pay / Cancel only (there is no user input worth saving). */
  saveEnabled?: boolean
  watcher?: FilingPageWatcherOverrides
}

/**
 * The filing page script: the page text/head, the navigation and task guards, the
 * save/submit/cancel handlers and the page watcher that inits the store and the button control.
 * Every return is individually ignorable - a page can supply its own handler and use the rest.
 */
export function useFilingPage<T = string>(options: FilingPageOptions<T>) {
  const {
    draftIdSource = 'query',
    preferApiMessageOnError = false,
    saveEnabled = true,
    submitGuard = 'alert'
  } = options

  const t = useNuxtApp().$i18n.t
  const route = useRoute()
  const urlParams = useUrlSearchParams('history')
  const modal = useFilingModals()
  const { handleButtonLoading, setAlertText: setBtnCtrlAlert } = useConnectButtonControl()

  const businessId = route.params.businessId as string
  // NB: an invalid route param draft id is handled by the store init - initFiling opens the
  // get draft filing error modal
  const draftId = draftIdSource === 'route-param'
    ? route.params.filingId as string
    : urlParams.draft as string | undefined

  const filingText = computed(() => {
    const params = toValue(options.i18nParams) ?? {}
    return {
      desc: t(`${options.i18nPrefix}.desc`, params),
      h1: t(`${options.i18nPrefix}.h1`, params),
      title: t(`${options.i18nPrefix}.title`, params)
    }
  })

  useHead({
    title: filingText.value.title
  })

  const { breadcrumbs, dashboardUrl } = useFilingNavigation(filingText.value.h1)

  const {
    hasChanges,
    canSubmit,
    canSave,
    canCancel,
    initBeforeUnload,
    revokeBeforeUnload
  } = useFilingTaskGuards(options.watchers, options.submitCondition)

  async function submitFiling() {
    try {
      setBtnCtrlAlert(undefined)
      if (options.preTaskGuard?.('submit')) {
        return
      }
      if (submitGuard !== 'none' && !canSubmit()) {
        if (submitGuard === 'alert') {
          setBtnCtrlAlert(t('text.noChangesToSubmit'), 'right')
        }
        return
      }
      handleButtonLoading(true, 'right', 1)
      await options.store.submit(true)
      revokeBeforeUnload()
      await navigateTo(dashboardUrl.value, { external: true })
    } catch (error) {
      if (draftIdSource === 'query') {
        const e = error as FetchError<{ filing?: { header?: { filingId?: number } } }>
        // in case there was a failure and it saved a draft
        const filingResp = e.response?._data
        urlParams.draft = String(filingResp?.filing?.header?.filingId)
      }
      await modal.openSaveFilingErrorModal(error, preferApiMessageOnError)
      handleButtonLoading(false)
      initBeforeUnload()
    }
  }

  async function saveDraftFiling(enableUnsavedChangesBlock = true) {
    try {
      if (enableUnsavedChangesBlock) {
        if (options.preTaskGuard?.('save')) {
          return
        }
        if (!canSave()) {
          return setBtnCtrlAlert(t('text.noChangesToSave'), 'left')
        }
      }
      await options.store.submit(false)
      revokeBeforeUnload()
      await navigateTo(dashboardUrl.value, { external: true })
    } catch (error) {
      if (enableUnsavedChangesBlock) {
        await modal.openSaveFilingErrorModal(error, preferApiMessageOnError)
        initBeforeUnload()
      }
    }
  }

  const saveFiling = saveEnabled ? saveDraftFiling : undefined

  async function cancelFiling() {
    if (!canCancel()) {
      return
    }
    await navigateTo(dashboardUrl.value, { external: true })
  }

  function onError(event: FormErrorEvent) {
    const firstError = event?.errors?.[0]

    if (firstError?.name === 'staffPayment.option') {
      options.staffPayRef?.value?.setFocusOnError()
    } else {
      onFormSubmitError(event)
    }
  }

  const { currentStep, nextStep, previousStep } = useFilingPageWatcher<T>({
    store: options.store,
    businessId,
    filingType: options.filingType,
    filingSubType: options.filingSubType,
    draftId,
    breadcrumbs,
    saveFiling: saveFiling ? { onClick: () => saveFiling(true), ...options.watcher?.saveFiling } : null,
    cancelFiling: { onClick: cancelFiling, ...options.watcher?.cancelFiling },
    submitFiling: { form: options.formId, ...options.watcher?.submitFiling },
    backButton: options.watcher?.backButton,
    steps: options.watcher?.steps,
    buttonLayout: options.watcher?.buttonLayout,
    setOnBeforeSessionExpired: async () => {
      // nothing to save when the page has no save button
      if (saveFiling && canSave()) {
        await saveFiling(false)
      }
    }
  })

  return {
    breadcrumbs,
    businessId,
    canCancel,
    canSave,
    canSubmit,
    cancelFiling,
    currentStep,
    dashboardUrl,
    draftId,
    filingText,
    hasChanges,
    initBeforeUnload,
    nextStep,
    onError,
    previousStep,
    revokeBeforeUnload,
    saveFiling,
    submitFiling,
    urlParams
  }
}
