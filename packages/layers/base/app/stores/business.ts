import { DateTime } from 'luxon'

/** Manages business data */
export const useBusinessStore = defineStore('business-store', () => {
  const service = useBusinessService()

  const business = shallowRef<BusinessDataPublic | BusinessData | undefined>(undefined)
  const businessContact = shallowRef<ContactPoint | undefined>(undefined)
  const businessFolio = ref('')

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
      alertList.push({ type: BusinessAlert.FROZEN, contentExtraOptions: [{ path: 'default' }] })
    }

    if (
      allWarnings.some(item => item.warningType === ApiWarningType.INVOLUNTARY_DISSOLUTION)
      || business.value?.inDissolution
    ) {
      const warning = allWarnings.find(item =>
        item.warningType?.includes(ApiWarningType.INVOLUNTARY_DISSOLUTION)
      )
      const dissolutionDate = toDate(warning?.data?.targetDissolutionDate || '')
      const contentDate = dissolutionDate ? toFormattedDateStr(dissolutionDate, DateTime.DATE_FULL) : undefined

      const maxUserDelaysReached = (warning?.data?.userDelays || 0) > 1
      const contentExtraOptions = [{
        path: maxUserDelaysReached ? 'maxDelaysReached' : 'default',
        link: { path: 'emailLink', to: 'emailTo' }
      }]
      alertList.push({ type: BusinessAlert.DISSOLUTION, contentDate, contentExtraOptions, hideContact: true })
    }

    // NOTES: The API will only return 1 good standing warning even if there are multiple reasons for it
    const goodStandingWarning = allWarnings.find(item => item.warningType === ApiWarningType.NOT_IN_GOOD_STANDING)
    if (business.value?.goodStanding === false || goodStandingWarning) {
      // The business goodStanding flag is false and/OR it has a good standing warning
      alertList.push({
        // Set alert type to TRANSITIONREQUIRED if there is a warning and it has the TRANSITION_NOT_FILED warning code
        type: [
          ApiWarningCode.TRANSITION_NOT_FILED,
          ApiWarningCode.TRANSITION_NOT_FILED_AFTER_12_MONTH_RESTORATION
        ].includes(goodStandingWarning?.code as ApiWarningCode)
          ? BusinessAlert.TRANSITIONREQUIRED
          : BusinessAlert.GOODSTANDING,
        contentExtraOptions: [{ path: 'default' }]
      })
    }

    const amalgWarning = allWarnings.find(
      item => item.warningType?.includes(ApiWarningType.FUTURE_EFFECTIVE_AMALGAMATION))
    if (amalgWarning) {
      const amalDate = amalgWarning.data?.amalgamationDate
        ? new Date(amalgWarning.data.amalgamationDate)
        : undefined
      alertList.push({
        type: BusinessAlert.AMALGAMATION,
        labelDate: amalDate ? toFormattedDateStr(amalDate, DateTime.DATE_FULL) : undefined
      })
    }

    if (allWarnings.some(item => item.warningType === ApiWarningType.MISSING_REQUIRED_BUSINESS_INFO)) {
      alertList.push({ type: BusinessAlert.MISSINGINFO, contentExtraOptions: [{ path: 'default' }] })
    }

    return alertList
  })

  async function init(identifier: string, slim = false, publicData = false, force = false, includeContact = false) {
    const [
      businessResp,
      contactResp
    ] = await Promise.all([
      service.getBusiness(identifier, slim, publicData, force),
      includeContact ? service.getAuthInfo(identifier, force) : undefined
    ])

    business.value = businessResp
    businessContact.value = contactResp?.contacts[0]
    businessFolio.value = contactResp?.folioNumber || ''
  }

  function isAllowedFiling(filingType: FilingType, filingSubType?: string) {
    const allowedFilings = (business.value as BusinessData)?.allowedActions?.filing.filingTypes
    const allowedFiling = allowedFilings.find(f => f.name === filingType && f.type === filingSubType)
    const allowed = !!allowedFiling
    if (!allowed) {
      /* eslint-disable-next-line max-len */
      logDevOnly(`filingType: ${filingType}${filingSubType ? `, subType: ${filingSubType}` : ''} not in businesses allowedActions list.`)
    }
    return allowed
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
    businessContact.value = undefined
  }

  return {
    business,
    businessAlerts,
    businessContact,
    businessFolio,
    businessIdentifier,
    businessName,
    init,
    isAllowedFiling,
    isLegalType,
    isFirm,
    isBaseCompany,
    $reset
  }
})
