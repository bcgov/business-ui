export const useFiling = () => {
  const { t, te } = useI18n()

  const getFilingName = (
    type: FilingType,
    subtype?: FilingSubType,
    year?: string | number,
    status?: FilingStatus
  ) => {
    // Special case for continuation in based on status
    if (type === FilingType.CONTINUATION_IN) {
      if (
        status
        && [
          FilingStatus.DRAFT,
          FilingStatus.AWAITING_REVIEW,
          FilingStatus.CHANGE_REQUESTED
        ].includes(status)
      ) {
        return t('filingName.continuationAuthorization')
      }
      return t('filingName.continuationIn')
    }

    return te(`filingName.${type}`)
      ? t(`filingName.${type}`, { year })
      : te(`filingName.${type}.${subtype}`)
        ? t(`filingName.${type}.${subtype}`, { year })
        : undefined
  }

  return {
    getFilingName
  }
}
