interface FilingPageWatcherOptions {
  store: { init: (businessId: string, draftId?: string) => Promise<void> }
  businessId: string
  draftId?: string
  feeCode: string
  feeLabel: string
  pageLabel: string
  formId: string
  saveFiling: { clickEvent: () => Promise<void>, label: string }
  cancelFiling: { clickEvent: () => Promise<void>, label: string }
  submitFiling?: { clickEvent: () => Promise<void>, label: string }
  breadcrumbs: Ref<ConnectBreadcrumb[]>
}

export function useFilingPageWatcher(options: FilingPageWatcherOptions) {
  const accountStore = useConnectAccountStore()
  const businessStore = useBusinessStore()
  const feeStore = useConnectFeeStore()
  const { setButtonControl } = useConnectButtonControl()

  watch(
    () => accountStore.currentAccount.id,
    async () => {
      await options.store.init(options.businessId, options.draftId)

      if (businessStore.business?.legalType) {
        try {
          await feeStore.initFees(
            [{ code: options.feeCode, entityType: businessStore.business.legalType, label: options.feeLabel }],
            { label: options.pageLabel }
          )
          feeStore.addReplaceFee(options.feeCode)
        } catch { /* ignore */ }
      }

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
              label: options.submitFiling?.label,
              trailingIcon: 'i-mdi-chevron-right'
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
