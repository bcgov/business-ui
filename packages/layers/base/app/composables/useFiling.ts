export const useFiling = () => {
  const { t, te } = useNuxtApp().$i18n
  const businessApi = useBusinessApi()
  const { setFilingDefault } = useBusinessTombstone()
  const { getBusinessParties } = useBusinessParty()
  const businessStore = useBusinessStore()
  const modal = useFilingModals()

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

  // TODO: cleanup error handling
  async function handleErrors(error: unknown) {
    let hasHandledError = false
    if (Array.isArray(error) && error.length) {
      const firstError = error[0]
      if (
        firstError
        && typeof firstError === 'object'
        && 'fn' in firstError
        && 'error' in firstError
      ) {
        await firstError.fn(firstError.error)
        hasHandledError = true
      }
    }
    if (!hasHandledError) {
      await modal.openInitFilingErrorModal(error)
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
        draftFilingResp = await businessApi.getAndValidateDraftFiling<T>(businessId, draftId, filingName)
      } else if (partiesParams) {
        partiesResp = getBusinessParties(businessId, partiesParams.roleClass, partiesParams.roleType)
      }
      const businessInitResp = businessStore.init(businessId, false, false, true)
      const [
        draftFiling,
        parties,
        [businessError, businessContactError]
      ] = await Promise.all([draftFilingResp, partiesResp, businessInitResp])

      // TODO - FUTURE - consistent error value accessing ie not: (errorValue, value.error, value.error.value)
      const errorConfig = [
        { error: businessError, fn: (error: unknown) => modal.openInitFilingErrorModal(error) },
        { error: businessContactError, fn: (error: unknown) => modal.openInitFilingErrorModal(error) },
        { error: parties?.error, fn: (error: unknown) => modal.openInitFilingErrorModal(error) },
        { error: draftFiling?.error.value, fn: (error: unknown) => modal.openGetDraftFilingErrorModal(error) }
      ]

      // filter out undefined or null errors
      const definedErrors = errorConfig.filter(e => !!e.error)

      if (definedErrors.length) {
        throw definedErrors
      }

      return {
        draftFiling,
        parties
      }
    } catch (error) {
      await handleErrors(error)
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
