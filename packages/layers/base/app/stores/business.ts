import { DateTime } from 'luxon'

/** Manages business data */
export const useBusinessStore = defineStore('business', () => {
  const { getBusiness } = useBusinessApi()
  const { getStoredFlag } = useConnectLaunchDarkly()

  const business = shallowRef<BusinessDataSlim | BusinessData | undefined>(undefined)

  const businessIdentifier = computed(() => business.value?.identifier)

  const businessName = computed(() => {
    if (!business.value) {
      return undefined
    }
    const isSolePropOrGp = (
      business.value.legalType === CorpTypeCd.SOLE_PROP
      || business.value.legalType === CorpTypeCd.PARTNERSHIP
    )
    if (business.value.alternateNames && isSolePropOrGp) {
      const alternateName = business.value.alternateNames
        .find(alternateName => alternateName.identifier === businessIdentifier.value)
      return alternateName?.name || business.value.legalName
    }
    return business.value.legalName
  })

  const businessAlerts = computed(() => {
    const allWarnings = business.value?.warnings || []
    const alertList = []

    if (business.value?.adminFreeze) {
      alertList.push({ type: BusinessAlert.FROZEN })
    }

    // NOTES: The API will only return 1 good standing warning even if there are multiple reasons for it
    const goodStandingWarning = allWarnings.find(item => item.warningType === ApiWarningType.NOT_IN_GOOD_STANDING)
    if (business.value?.goodStanding === false || goodStandingWarning) {
      // The business goodStanding flag is false and/OR it has a good standing warning
      alertList.push({
        // Set alert type to TRANSITIONREQUIRED if there is a warning and it has the TRANSITION_NOT_FILED warning code
        type: goodStandingWarning?.code === ApiWarningCode.TRANSITION_NOT_FILED
          ? BusinessAlert.TRANSITIONREQUIRED
          : BusinessAlert.GOODSTANDING
      })
    }

    if (
      allWarnings.some(item => item.warningType === ApiWarningType.INVOLUNTARY_DISSOLUTION)
      || business.value?.inDissolution
    ) {
      const warning = allWarnings.find(item =>
        item.warningType?.includes(ApiWarningType.INVOLUNTARY_DISSOLUTION)
      )
      const targetDissolutionDate = toDate(warning?.data?.targetDissolutionDate || '')
      const days = targetDissolutionDate
        ? daysBetween(new Date(), targetDissolutionDate)
        : undefined
      alertList.push({ type: BusinessAlert.DISSOLUTION, days })
    }

    const amalgWarning = allWarnings.find(
      item => item.warningType?.includes(ApiWarningType.FUTURE_EFFECTIVE_AMALGAMATION))
    if (amalgWarning) {
      const amalDate = amalgWarning.data?.amalgamationDate
        ? new Date(amalgWarning.data.amalgamationDate)
        : undefined
      alertList.push({
        type: BusinessAlert.AMALGAMATION,
        date: amalDate ? toFormattedDateStr(amalDate, DateTime.DATE_FULL) : undefined
      })
    }

    if (allWarnings.some(item => item.warningType === ApiWarningType.MISSING_REQUIRED_BUSINESS_INFO)) {
      alertList.push({ type: BusinessAlert.MISSINGINFO })
    }

    return alertList
  })

  async function init(identifier: string, slim = false, force = false) {
    const businessCached = businessIdentifier.value && identifier === businessIdentifier.value

    if (!businessCached || force) {
      // @ts-expect-error ts doesn't capture slim true/false properly
      business.value = await getBusiness(identifier, slim)
    }
  }

  /** Whether the entity belongs to one of the passed-in legal types */
  function isLegalType(legalTypes: CorpTypeCd[]): boolean {
    return legalTypes.includes(business.value?.legalType as CorpTypeCd)
  }

  /** Whether the entity is a Sole Proprietorship or General Partnership. */
  function isFirm(): boolean {
    return isLegalType([CorpTypeCd.SOLE_PROP, CorpTypeCd.PARTNERSHIP])
  }

  /** Whether the entity is a base company (BC/BEN/CC/ULC or C/CBEN/CCC/CUL). */
  function isBaseCompany(): boolean {
    return isLegalType([
      CorpTypeCd.BC_COMPANY,
      CorpTypeCd.BENEFIT_COMPANY,
      CorpTypeCd.BC_CCC,
      CorpTypeCd.BC_ULC_COMPANY,
      CorpTypeCd.CONTINUE_IN,
      CorpTypeCd.BEN_CONTINUE_IN,
      CorpTypeCd.CCC_CONTINUE_IN,
      CorpTypeCd.ULC_CONTINUE_IN
    ])
  }

  function $reset() {
    business.value = undefined
  }

  return {
    business,
    businessAlerts,
    businessIdentifier,
    businessName,
    init,
    isLegalType,
    isFirm,
    isBaseCompany,
    $reset
  }
})
