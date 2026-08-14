import { DateTime } from 'luxon'

/**
 * Provides the reason a business is in its current (historical) state,
 * e.g. 'Amalgamation – August 13, 2026 – BC1234567' or 'Voluntary Dissolution – January 15, 2026',
 * using the public business/filing data.
 */
export const useBusinessStateReason = () => {
  const t = useNuxtApp().$i18n.t
  const businessStore = useBusinessStore()
  const { business } = storeToRefs(businessStore)
  const service = useBusinessService()

  const enDash = '–' // ALT + 0150

  /** Return the reason text for the business state (empty when not historical). */
  const getStateReason = async (): Promise<string> => {
    const biz = business.value
    if (!biz || biz.state !== EntityState.HISTORICAL) {
      return ''
    }

    // reason for amalgamation
    if (biz.amalgamatedInto) {
      const name = t('stateReason.amalgamation')
      const amalgamationDate = toDate(biz.amalgamatedInto.amalgamationDate)
      const date = amalgamationDate
        ? toFormattedDateStr(amalgamationDate, DateTime.DATE_FULL)
        : `[${t('text.unknown')}]`
      const identifier = biz.amalgamatedInto.identifier || t('label.unknownCompany')
      return `${name} ${enDash} ${date} ${enDash} ${identifier}`
    }

    if (!biz.stateFiling) {
      return ''
    }
    const filingId = biz.stateFiling.split('/').pop()
    if (!filingId) {
      return ''
    }
    const stateFiling = await service.getPublicStateFiling(biz.identifier, filingId)
      .then(resp => resp?.filing)
      .catch((error) => {
        console.warn('Error fetching state filing', error)
        return undefined
      })
    const filingType = stateFiling?.header?.name
    if (!filingType) {
      return ''
    }
    const filingData: PublicStateFilingBody
      = (stateFiling as Partial<Record<string, PublicStateFilingBody>>)[filingType] || {}

    // reason for dissolution
    if (filingType === FilingType.DISSOLUTION) {
      let reason = t('stateReason.unknown')
      switch (filingData.type) {
        case DissolutionType.ADMINISTRATIVE:
          reason = t('stateReason.dissolutionAdministrative')
          break
        case DissolutionType.INVOLUNTARY:
          reason = t('stateReason.dissolutionInvoluntary')
          break
        case DissolutionType.VOLUNTARY:
          reason = businessStore.isFirm() ? t('stateReason.dissolutionFirm') : t('stateReason.dissolutionVoluntary')
      }
      const dissolutionDate = toDate(filingData.dissolutionDate || stateFiling.header?.effectiveDate || '')
      const date = dissolutionDate
        ? toFormattedDateStr(dissolutionDate, DateTime.DATE_FULL)
        : `[${t('text.unknown')}]`
      return `${reason} ${enDash} ${date}`
    }

    // reason for put back off
    if (filingType === FilingType.PUT_BACK_OFF && filingData.reason) {
      const expiryDate = toDate(filingData.expiryDate || '')
      const date = expiryDate
        ? toFormattedDateStr(expiryDate, DateTime.DATE_FULL)
        : `[${t('text.unknown')}]`
      return `${filingData.reason} on ${date}`
    }

    // reason for continuation out and default 'reason'
    const effectiveDate = toDate(stateFiling.header?.effectiveDate || '')
    const date = (effectiveDate && toPacificDateTime(effectiveDate)) || `[${t('text.unknown')}]`
    let reason = ''
    if (filingType === FilingType.CONTINUATION_OUT) {
      reason = t('stateReason.continuationOut')
    } else {
      reason = t(`filingName.${filingType}`)
      if (reason === `filingName.${filingType}`) {
        reason = t('stateReason.unknown')
      }
    }
    return `${reason} ${enDash} ${date}`
  }

  /** Append the state reason text beside the state badge in the business tombstone. */
  const setTombstoneStateReason = async (): Promise<void> => {
    const reason = await getStateReason()
    if (reason) {
      const { businessTombstone } = useBusinessTombstone()
      businessTombstone.value.details = [
        ...(businessTombstone.value.details || []),
        { text: reason }
      ]
    }
  }

  return {
    getStateReason,
    setTombstoneStateReason
  }
}
