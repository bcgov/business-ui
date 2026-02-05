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

  const { t } = useNuxtApp().$i18n
  const unknownText = `[${t('text.unknown')}]`

  const businessAlerts = computed(() => {
    const allWarnings = business.value?.warnings || []
    const alertList: BusinessAlertItem[] = []

    if (business.value?.adminFreeze) {
      alertList.push({
        alertType: BusinessAlert.FROZEN,
        contentExtra: [{ path: 'default' }],
        icon: 'i-mdi-alert',
        label: t(`businessAlert.${BusinessAlert.FROZEN}.label`),
        showContact: true,
        ui: { leadingIcon: 'text-warning' }
      })
    }

    if (
      allWarnings.some(item => item.warningType === ApiWarningType.INVOLUNTARY_DISSOLUTION)
      || business.value?.inDissolution
    ) {
      const warning = allWarnings.find(item =>
        item.warningType?.includes(ApiWarningType.INVOLUNTARY_DISSOLUTION)
      )
      const dissolutionDate = toDate(warning?.data?.targetDissolutionDate || '')
      const date = dissolutionDate ? toFormattedDateStr(dissolutionDate, DateTime.DATE_FULL) : undefined

      const maxUserDelaysReached = (warning?.data?.userDelays || 0) > 1
      const contentExtra = [{
        path: maxUserDelaysReached ? 'maxDelaysReached' : 'default',
        link: { path: 'emailLink', to: 'emailTo' }
      }]
      alertList.push({
        alertType: BusinessAlert.DISSOLUTION,
        contentExtra,
        date: date || unknownText,
        icon: 'i-mdi-alert',
        label: t(`businessAlert.${BusinessAlert.DISSOLUTION}.label`),
        showContact: false,
        ui: { leadingIcon: 'text-error' }
      })
    }

    // NOTES: The API will only return 1 good standing warning even if there are multiple reasons for it
    const goodStandingWarning = allWarnings.find(item => item.warningType === ApiWarningType.NOT_IN_GOOD_STANDING)
    if (business.value?.goodStanding === false || goodStandingWarning) {
      // The business goodStanding flag is false and/OR it has a good standing warning
      const alertType = [
        ApiWarningCode.TRANSITION_NOT_FILED,
        ApiWarningCode.TRANSITION_NOT_FILED_AFTER_12_MONTH_RESTORATION
      ].includes(goodStandingWarning?.code as ApiWarningCode)
        // Set alert type to TRANSITIONREQUIRED if it has one of the transition warning codes
        ? BusinessAlert.TRANSITIONREQUIRED
        : BusinessAlert.GOODSTANDING
      alertList.push({
        alertType,
        contentExtra: [{ path: 'default' }],
        icon: 'i-mdi-alert',
        label: t(`businessAlert.${alertType}.label`),
        showContact: true,
        ui: { leadingIcon: 'text-warning' }
      })
    }

    const amalgWarning = allWarnings.find(
      item => item.warningType?.includes(ApiWarningType.FUTURE_EFFECTIVE_AMALGAMATION))
    if (amalgWarning) {
      const amalDate = amalgWarning.data?.amalgamationDate
        ? new Date(amalgWarning.data.amalgamationDate)
        : undefined
      const displayDate = amalDate ? toFormattedDateStr(amalDate, DateTime.DATE_FULL) : unknownText
      alertList.push({
        alertType: BusinessAlert.AMALGAMATION,
        contentExtra: [],
        icon: 'i-mdi-alert',
        label: t(`businessAlert.${BusinessAlert.AMALGAMATION}.label`, { date: displayDate }),
        showContact: true,
        ui: { leadingIcon: 'text-warning' }
      })
    }

    if (allWarnings.some(item => item.warningType === ApiWarningType.MISSING_REQUIRED_BUSINESS_INFO)) {
      alertList.push({
        alertType: BusinessAlert.MISSINGINFO,
        contentExtra: [{ path: 'default' }],
        icon: 'i-mdi-alert',
        label: t(`businessAlert.${BusinessAlert.MISSINGINFO}.label`),
        showContact: true,
        ui: { leadingIcon: 'text-warning' }
      })
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
