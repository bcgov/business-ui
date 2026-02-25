interface StepOverride {
  leftStacked?: boolean
  rightStacked?: boolean
  saveFiling?: ConnectButton | null
  cancelFiling?: ConnectButton | null
  submitFiling?: ConnectButton | null
  backButton?: ConnectButton | null
}

interface FilingPageWatcherOptions<T> {
  store: { init: (businessId: string, filingSubType?: T, draftId?: string) => Promise<void> }
  businessId: string
  filingType: FilingType
  filingSubType?: T
  draftId?: string
  saveFiling: ConnectButton | null
  cancelFiling: ConnectButton | null
  submitFiling?: ConnectButton | null
  backButton?: ConnectButton | null
  steps?: StepOverride[] // pass array of objects to use steps - object can be empty
  breadcrumbs: Ref<ConnectBreadcrumb[]>
  setOnBeforeSessionExpired: () => Promise<void>
  buttonLayout?: 'bottomDefault' | 'stackedDefault'
}

export function useFilingPageWatcher<T>(options: FilingPageWatcherOptions<T>) {
  const { t } = useNuxtApp().$i18n
  const accountStore = useConnectAccountStore()
  const { setButtonControl } = useConnectButtonControl()
  const _currentStep = ref(1)
  const currentStep = computed({
    get: () => _currentStep.value,
    set: (val: number) => {
      const max = options.steps?.length || 1
      let next = Math.round(val)
      // normalize current step to be between 1 and max steps
      if (next < 1) {
        next = 1
      } else if (next > max) {
        next = max
      }

      if (_currentStep.value !== next) {
        _currentStep.value = next
      }
    }
  })

  function nextStep() {
    _currentStep.value++
    document.querySelector('main')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }
  function previousStep() {
    _currentStep.value--
    document.querySelector('main')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }

  function updateButtonControl() {
    const isMultiStep = !!options.steps && options.steps.length > 0
    const stepIndex = currentStep.value - 1
    const isFirstStep = currentStep.value === 1
    const isLastStep = !isMultiStep || currentStep.value === (options.steps?.length || 1)

    const step = options.steps?.[stepIndex] ?? {}

    // button defaults with main override and step override
    const buttons: Partial<Record<'back' | 'cancel' | 'save' | 'primary', ConnectButton>> = {
      ...((options.backButton !== null && step?.backButton !== null) && {
        back: {
          label: t('label.back'),
          variant: 'outline' as const,
          icon: 'i-mdi-chevron-left',
          onClick: previousStep,
          ...options.backButton,
          ...(step?.backButton || {})
        }
      }),
      ...((options.cancelFiling !== null && step?.cancelFiling !== null) && {
        cancel: {
          label: t('label.cancel'),
          variant: 'outline' as const,
          ...options.cancelFiling,
          ...(step?.cancelFiling || {})
        }
      }),
      ...((options.saveFiling !== null && step?.saveFiling !== null) && {
        save: {
          label: t('label.saveResumeLater'),
          variant: 'outline' as const,
          ...options.saveFiling,
          ...(step?.saveFiling || {})
        }
      }),
      ...((options.submitFiling !== null && step?.submitFiling !== null) && {
        primary: {
          label: isLastStep ? t('label.submit') : t('label.next'),
          trailingIcon: 'i-mdi-chevron-right',
          type: isLastStep ? 'submit' : 'button',
          onClick: !isLastStep ? () => { nextStep() } : undefined,
          ...options.submitFiling,
          ...(step?.submitFiling || {})
        }
      })
    }

    // predefined button group order/grouping
    const buttonLayouts = {
      stackedDefault: {
        left: [buttons.back, buttons.cancel],
        right: [buttons.save, buttons.primary]
      },
      bottomDefault: {
        left: [buttons.back, buttons.save],
        right: [buttons.cancel, buttons.primary]
      }
    }

    const layout = buttonLayouts[options.buttonLayout || 'bottomDefault']

    function getGroupButtons(btns: (ConnectButton | null | undefined)[]) {
      // remove back button if not multi step or if its the first step
      return btns.filter((btn): btn is ConnectButton => {
        if (!btn) {
          return false
        }
        if (btn === buttons.back) {
          return isMultiStep && !isFirstStep
        }
        return true
      })
    }

    setButtonControl({
      leftGroup: {
        stacked: step?.leftStacked || false,
        buttons: getGroupButtons(layout.left)
      },
      rightGroup: {
        stacked: step?.rightStacked || false,
        buttons: getGroupButtons(layout.right)
      }
    })
  }

  watch(
    [() => accountStore.currentAccount.id, currentStep],
    async ([newAccountId, _newStep], [oldAccountId, _oldStep]) => {
      // prevent race condition of filing being submitted prematurely when moving to last step
      await new Promise(resolve => setTimeout(resolve, 1))
      // always update button control when step changes
      updateButtonControl()

      // trigger full page init only when account changes
      if (newAccountId !== oldAccountId) {
        setBreadcrumbs(options.breadcrumbs.value)

        setOnBeforeSessionExpired(async () => {
          await options.setOnBeforeSessionExpired()
        })

        await options.store.init(options.businessId, options.filingSubType, options.draftId)
      }
    },
    { immediate: true }
  )

  return {
    currentStep,
    nextStep,
    previousStep
  }
}
