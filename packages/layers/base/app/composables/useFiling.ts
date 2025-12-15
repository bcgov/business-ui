export const useFiling = () => {
  const { t, te } = useNuxtApp().$i18n
  const businessApi = useBusinessApi()
  const { setFilingDefault } = useBusinessTombstone()
  const { getBusinessParties } = useBusinessParty()
  const businessStore = useBusinessStore()
  const feeStore = useConnectFeeStore()
  const modal = useFilingModals()
  const permissionsStore = useBusinessPermissionsStore()

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

  async function initFiling<T extends FilingRecord>(
    businessId: string,
    filingName: FilingType,
    filingSubType?: string,
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

      const draftPromise = draftId
        ? businessApi.getAndValidateDraftFiling<T>(businessId, draftId, filingName)
        : undefined

      const partiesPromise = partiesParams
        ? getBusinessParties(businessId, partiesParams.roleClass, partiesParams.roleType)
        : undefined

      const [
        [businessError, businessContactError],
        draftFiling,
        parties
      ] = await Promise.all([
        businessStore.init(businessId, false, false, true),
        draftPromise,
        partiesPromise,
        permissionsStore.init()
      ])

      const genericError = [
        businessError,
        businessContactError,
        parties?.error
      ].find(e => !!e)

      if (genericError) {
        throw genericError
      }

      if (draftFiling?.error.value) {
        throw new Error('invalid-draft-filing')
      }

      const isAuthorized = permissionsStore.isAuthorizedByFilingType(
        filingName,
        filingSubType as FilingSubType
      )

      const isAllowed = draftId || businessStore.isAllowedFiling(
        filingName,
        filingSubType
      )

      if (!isAuthorized || !isAllowed) {
        // no fee code from user allowed filing types for this business
        throw new Error('filing-not-allowed')
      }

      try {
        const feeEntityType = businessStore.business!.legalType
        const feeCode = te(`page.${filingName}.${filingSubType}.feeCode`)
          ? t(`page.${filingName}.${filingSubType}.feeCode`)
          : t(`page.${filingName}.feeCode`)
        const feeLabel = te(`page.${filingName}.${filingSubType}.feeLabel`)
          ? t(`page.${filingName}.${filingSubType}.feeLabel`)
          : t(`page.${filingName}.feeLabel`)
        await feeStore.initFees(
          [{ code: feeCode, entityType: feeEntityType, label: feeLabel }],
          { label: feeLabel }
        )
        feeStore.addReplaceFee(feeCode)
      } catch { /* ignore */ }

      return {
        draftFiling,
        parties
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'invalid-draft-filing') {
        await modal.openGetDraftFilingErrorModal(error)
      } else if (error instanceof Error && error.message === 'filing-not-allowed') {
        await modal.openFilingNotAllowedErrorModal()
      } else {
        await modal.openInitFilingErrorModal(error)
      }
      return {
        draftFiling: undefined,
        parties: undefined
      }
    }
  }

  function getCommonFilingPayloadData(
    courtOrder?: CourtOrderPoaSchema,
    documentId?: string
  ): FilingPayloadData {
    return {
      ...(courtOrder?.courtOrderNumber ? { courtOrder: formatCourtOrderApi(courtOrder) } : {}),
      ...(documentId ? { documentId } : {})
    }
  }

  return {
    getCommonFilingPayloadData,
    getFilingName,
    initFiling
  }
}
