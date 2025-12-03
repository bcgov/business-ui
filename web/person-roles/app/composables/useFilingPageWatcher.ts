interface FilingPageWatcherOptions {
  store: { init: (businessId: string, draftId?: string) => Promise<void> }
  businessId: string
  draftId?: string
  feeCode: string
  feeLabel: string
  pageLabel: string
  formId: string
  saveFiling: (resumeLater?: boolean, disableCheck?: boolean) => Promise<void>
  cancelFiling: () => Promise<void>
  breadcrumbs: Ref<object>
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
            { onClick: () => options.saveFiling(true),
              label: 'Save & Resume Later',
              variant: 'outline'
            }
          ]
        },
        rightGroup: {
          buttons: [
            { onClick: options.cancelFiling, label: 'Cancel', variant: 'outline' },
            { label: 'Submit', type: 'submit', trailingIcon: 'i-mdi-chevron-right', form: options.formId }
          ]
        }
      })

      setOnBeforeSessionExpired(async () => {
        await options.saveFiling(false, true)
      })
    },
    { immediate: true }
  )
}
