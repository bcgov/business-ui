export const useStandaloneTransitionFeeStore = () => {
  const feeStore = useConnectFeeStore()

  const standaloneTransitionFeeCode = 'TRANP'
  const feeLangkey = 'ConnectFeeWidget.feeSummary.itemLabels.TRANP'

  const { t } = useI18n()

  const initFeeStore = async () => {
    await feeStore.initFees(
      [
        { code: standaloneTransitionFeeCode, entityType: 'BC', label: t(feeLangkey) },
        { code: standaloneTransitionFeeCode, entityType: 'BC', label: t(feeLangkey) }
      ],
      { label: t(feeLangkey), matchServiceFeeToCode: standaloneTransitionFeeCode }
    )

    feeStore.addReplaceFee(standaloneTransitionFeeCode)
  }

  return {
    initFeeStore
  }
}
