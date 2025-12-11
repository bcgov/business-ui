interface FilingPageWatcherOptions<T> {
  store: { init: (businessId: string, filingSubType?: T, draftId?: string) => Promise<void> }
  businessId: string
  filingType: FilingType
  filingSubType?: T
  draftId?: string
  formId: string
  saveFiling: { clickEvent: (...args: unknown[]) => Promise<void>, label: string }
  cancelFiling: { clickEvent: () => Promise<void>, label: string }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  submitFiling?: { clickEvent: (...args: any[]) => Promise<void>, label: string }
  breadcrumbs: Ref<ConnectBreadcrumb[]>
}

export function useFilingPageWatcher<T>(options: FilingPageWatcherOptions<T>) {
  const accountStore = useConnectAccountStore()
  const { setButtonControl } = useConnectButtonControl()
  watch(
    () => accountStore.currentAccount.id,
    async () => {
      await options.store.init(options.businessId, options.filingSubType, options.draftId)

      setBreadcrumbs(options.breadcrumbs.value)

      setButtonControl({
        leftGroup: {
          buttons: [
            {
              onClick: options.saveFiling.clickEvent,
              label: options.saveFiling.label,
              variant: 'outline'
            }
          ]
        },
        rightGroup: {
          buttons: [
            {
              onClick: options.cancelFiling.clickEvent,
              label: options.cancelFiling.label,
              variant: 'outline'
            },
            {
              onClick: options.submitFiling?.clickEvent,
              form: options.formId,
              label: options.submitFiling?.label,
              trailingIcon: 'i-mdi-chevron-right',
              type: 'submit'
            }
          ]
        }
      })

      setOnBeforeSessionExpired(async () => {
        await options.saveFiling.clickEvent(false, true)
      })
    },
    { immediate: true }
  )
}
