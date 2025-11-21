export const useFiling = () => {
  const { t, te } = useI18n()
  const businessApi = useBusinessApi()
  const { setFilingDefault } = useBusinessTombstone()
  const { getBusinessParties } = useBusinessParty()
  const businessStore = useBusinessStore()
  const modal = useFilingModals()
  const { errorModal } = useModal()

  function getFilingName(
    type: FilingType,
    subtype?: FilingSubType,
    year?: string | number,
    status?: FilingStatus
  ) {
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

  function handleErrors(errors: { error: Error | undefined | null, i18nPrefix: string }[]) {
    for (const { error, i18nPrefix } of errors) {
      if (error) {
        errorModal.open({ error: error, i18nPrefix })
        return true
      }
    }
  }

  async function initFiling<T extends FilingRecord>(
    businessId: string,
    filingName: FilingType,
    draftId?: string,
    partiesParams?: { roleClass?: RoleClass, roleType?: RoleType }
    // officeParams?: office config (i.e. records, liquidation, etc.)
  ) {
    try {
      // throw error and show modal if invalid business ID
      if (businessId === 'undefined') {
        throw createError({ statusCode: 404 })
      }
      // set masthead data
      setFilingDefault(businessId, false)

      let draftFilingResp = undefined
      let partiesResp = undefined
      if (draftId) {
        draftFilingResp = businessApi.getAndValidateDraftFiling<T>(businessId, draftId, filingName)
      } else if (partiesParams) {
        partiesResp = getBusinessParties(businessId, partiesParams.roleClass, partiesParams.roleType)
      }
      const businessInitResp = businessStore.init(businessId, false, false, true)
      const [
        draftFiling,
        parties,
        [businessError, businessContactError]
      ] = await Promise.all([draftFilingResp, partiesResp, businessInitResp])

      const errors = [
        { error: businessError, i18nPrefix: 'modal.error.business.init' },
        { error: businessContactError, i18nPrefix: 'modal.error.business.contact' },
        { error: parties?.error, i18nPrefix: 'modal.error.business.parties' }
      ]
      if (handleErrors(errors)) {
        return {
          draftFiling: undefined,
          parties: undefined
        }
      }
      if (draftFiling?.error.value) {
        modal.openGetDraftFilingErrorModal(draftFiling.error.value)
      }

      return {
        draftFiling,
        parties
      }
    } catch (error) {
      await modal.openInitFilingErrorModal(error)
      return {
        draftFiling: undefined,
        parties: undefined
      }
    }
  }

  return {
    getFilingName,
    initFiling
  }
}
