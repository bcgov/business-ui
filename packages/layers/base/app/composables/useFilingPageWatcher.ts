import type { ButtonProps } from '@nuxt/ui'

interface StepOverride {
  leftStacked?: boolean
  rightStacked?: boolean
  saveFiling?: ButtonProps
  cancelFiling?: ButtonProps
  submitFiling?: ButtonProps
  backButton?: ButtonProps
}

interface FilingPageWatcherOptions<T> {
  store: { init: (businessId: string, filingSubType?: T, draftId?: string) => Promise<void> }
  businessId: string
  filingType: FilingType
  filingSubType?: T
  draftId?: string
  saveFiling: ButtonProps
  cancelFiling: ButtonProps
  submitFiling?: ButtonProps
  backButton?: ButtonProps
  steps?: StepOverride[]
  breadcrumbs: Ref<ConnectBreadcrumb[]>
  setOnBeforeSessionExpired: () => Promise<void>
}

export function useFilingPageWatcher<T>(options: FilingPageWatcherOptions<T>) {
  const { t } = useNuxtApp().$i18n
  const accountStore = useConnectAccountStore()
  const { setButtonControl } = useConnectButtonControl()
  const route = useRoute()
  const currentStep = ref(1)

  function updateButtonControl() {
    const isMultiStep = !!options.steps
    let stepIndex = -1
    let isLastStep = true
    let isFirstStep = true

    if (options.steps) {
      if (currentStep.value < 1) {
        currentStep.value = 1
      }
      if (currentStep.value > options.steps.length) {
        currentStep.value = options.steps.length
      }

      stepIndex = currentStep.value - 1
      isLastStep = stepIndex === options.steps.length - 1
      isFirstStep = stepIndex === 0
    }

    const step = (isMultiStep && options.steps?.[stepIndex]) ? options.steps[stepIndex] : {}
    const isStackedLayout = route.meta.layout === 'connect-pay-tombstone-buttons-stacked'
    const blockClass = 'min-w-[300px] justify-center' // TODO: figure out why `block: true` attr not working in button control

    const buttons: Record<'back' | 'cancel' | 'save' | 'primary', ConnectButton> = {
      back: {
        label: t('label.back'),
        variant: 'outline' as const,
        icon: 'i-mdi-chevron-left',
        removeAlertSpacing: isStackedLayout,
        onClick: () => { currentStep.value-- },
        ...options.backButton,
        ...(step?.backButton || {})
      },
      cancel: {
        label: t('label.cancel'),
        variant: 'outline' as const,
        class: (isStackedLayout && isFirstStep) ? blockClass : '',
        removeAlertSpacing: isStackedLayout,
        ...options.cancelFiling,
        ...(step?.cancelFiling || {})
      },
      save: {
        label: t('label.saveResumeLater'),
        variant: 'outline' as const,
        class: isStackedLayout ? blockClass : '',
        removeAlertSpacing: isStackedLayout,
        ...options.saveFiling,
        ...(step?.saveFiling || {})
      },
      primary: {
        label: isLastStep ? t('label.submit') : t('label.next'),
        trailingIcon: 'i-mdi-chevron-right',
        type: isLastStep ? 'submit' : 'button',
        class: isStackedLayout ? blockClass : '',
        removeAlertSpacing: isStackedLayout,
        onClick: !isLastStep ? () => { currentStep.value++ } : undefined,
        ...options.submitFiling,
        ...(step?.submitFiling || {})
      }
    }

    let leftGroupButtons: ConnectButton[] = []
    let rightGroupButtons: ConnectButton[] = []

    if (isStackedLayout) {
      leftGroupButtons = [
        ...((isMultiStep && !isFirstStep) ? [buttons.back] : []),
        buttons.cancel
      ]
      rightGroupButtons = [buttons.save, buttons.primary]
    } else {
      leftGroupButtons = [
        ...((isMultiStep && !isFirstStep) ? [buttons.back] : []),
        buttons.save
      ]
      rightGroupButtons = [buttons.cancel, buttons.primary]
    }

    setButtonControl({
      leftGroup: {
        stacked: step?.leftStacked || false,
        buttons: leftGroupButtons
      },
      rightGroup: {
        stacked: step?.rightStacked || false,
        buttons: rightGroupButtons
      }
    })
  }

  watch(
    [() => accountStore.currentAccount.id, currentStep],
    async ([newAccountId, _newStep], [oldAccountId, _oldStep]) => {
      updateButtonControl()

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
    currentStep
  }
}
