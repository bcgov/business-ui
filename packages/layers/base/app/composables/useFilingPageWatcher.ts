import type { ButtonProps } from '@nuxt/ui'

interface FilingPageWatcherOptions<T> {
  store: { init: (businessId: string, filingSubType?: T, draftId?: string) => Promise<void> }
  businessId: string
  filingType: FilingType
  filingSubType?: T
  draftId?: string
  saveFiling: ButtonProps
  cancelFiling: ButtonProps
  submitFiling?: ButtonProps
  breadcrumbs: Ref<ConnectBreadcrumb[]>
  setOnBeforeSessionExpired: () => Promise<void>
}

export function useFilingPageWatcher<T>(options: FilingPageWatcherOptions<T>) {
  const { t } = useNuxtApp().$i18n
  const accountStore = useConnectAccountStore()
  const { setButtonControl } = useConnectButtonControl()
  watch(
    () => accountStore.currentAccount.id,
    async () => {
      setBreadcrumbs(options.breadcrumbs.value)

      setButtonControl({
        leftGroup: {
          buttons: [
            {
              label: t('label.saveResumeLater'),
              variant: 'outline',
              ...options.saveFiling
            }
          ]
        },
        rightGroup: {
          buttons: [
            {
              label: t('label.cancel'),
              variant: 'outline',
              ...options.cancelFiling
            },
            {
              label: t('label.submit'),
              trailingIcon: 'i-mdi-chevron-right',
              type: 'submit',
              ...options.submitFiling
            }
          ]
        }
      })

      setOnBeforeSessionExpired(async () => {
        await options.setOnBeforeSessionExpired()
      })

      await options.store.init(options.businessId, options.filingSubType, options.draftId)
    },
    { immediate: true }
  )
}
