interface FilingPageWatcherOptions<T> {
  store: { init: (businessId: string, filingSubType?: T, draftId?: string) => Promise<string | undefined> }
  businessId: string
  filingType: FilingType
  filingSubType?: T
  draftId?: string
  formId: string
  saveFiling: { clickEvent: (...args: unknown[]) => Promise<void>, label: string }
  cancelFiling: { clickEvent: () => Promise<void>, label: string }
  submitFiling?: { clickEvent: () => Promise<void>, label: string }
  breadcrumbs: Ref<ConnectBreadcrumb[]>
}

export function useFilingPageWatcher<T>(options: FilingPageWatcherOptions<T>) {
  const accountStore = useConnectAccountStore()
  const businessStore = useBusinessStore()
  const feeStore = useConnectFeeStore()
  const { setButtonControl } = useConnectButtonControl()
  const { t, te } = useNuxtApp().$i18n
  watch(
    () => accountStore.currentAccount.id,
    async () => {
      const feeCode = await options.store.init(options.businessId, options.filingSubType, options.draftId)
      if (feeCode) {
        if (businessStore.business?.legalType) {
          try {
            const feeLabel = te(`page.${options.filingType}.${options.filingSubType}`)
              ? t(`page.${options.filingType}.${options.filingSubType}`)
              : t(`page.${options.filingType}`)
            await feeStore.initFees(
              [{ code: feeCode, entityType: businessStore.business.legalType, label: feeLabel }],
              { label: feeLabel }
            )
            feeStore.addReplaceFee(feeCode)
          } catch { /* ignore */ }
        }
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
