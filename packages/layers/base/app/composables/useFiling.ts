import { getFilingName } from '#business/app/utils/get-filing-name'

export const useFiling = () => {
  const { t, te } = useNuxtApp().$i18n
  const service = useBusinessService()
  const { setFilingDefault } = useBusinessTombstone()
  const { getBusinessParties } = useBusinessParty()
  const { getBusinessAddresses } = useBusinessAddresses()
  const businessStore = useBusinessStore()
  const feeStore = useConnectFeeStore()
  const modal = useFilingModals()
  const permissionsStore = useBusinessPermissionsStore()
  const { authUser } = useConnectAuth()

  async function initFiling<T extends FilingRecord>(
    businessId: string,
    filingName: FilingType,
    filingSubType?: string,
    draftId?: string,
    partiesParams?: { roleClass?: RoleClass, roleType?: RoleType, all?: boolean, date?: string },
    officeTypes?: OfficeType[],
    fetchShareClasses?: boolean
  ) {
    try {
      // throw error and show modal if invalid business ID
      if (businessId === 'undefined') {
        throw createError({ statusCode: 404 })
      }

      const draftPromise = draftId
        ? service.getAndValidateDraftFiling<T>(businessId, draftId, filingName)
          .catch(() => { throw new Error('invalid-draft-filing') }) // special case for loading drafts in initFiling - changes TBD
        : undefined

      const partiesPromise = partiesParams
        ? getBusinessParties(
          businessId,
          partiesParams.roleClass,
          partiesParams.roleType,
          partiesParams.all,
          partiesParams.date
        )
        : undefined

      const addressesPromise = officeTypes
        ? getBusinessAddresses(businessId, 'table', officeTypes)
        : undefined

      const shareClassesPromise = fetchShareClasses
        ? service.getShareClasses(businessId)
        : undefined

      const [
        _tombstoneInit,
        _businessInit,
        draftFiling,
        parties,
        _permissions,
        addresses,
        shareClasses
      ] = await Promise.all([
        setFilingDefault(businessId, false),
        businessStore.init(businessId, false, false, false, true),
        draftPromise,
        partiesPromise,
        permissionsStore.init(businessId),
        addressesPromise,
        shareClassesPromise
      ])

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
        parties,
        addresses,
        shareClasses
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'invalid-draft-filing') {
        modal.openGetDraftFilingErrorModal(error)
      } else if (error instanceof Error && error.message === 'filing-not-allowed') {
        modal.openFilingNotAllowedErrorModal()
      } else {
        modal.openInitFilingErrorModal(error)
      }
      return {
        draftFiling: undefined,
        parties: undefined,
        addresses: undefined,
        shareClasses: undefined
      }
    }
  }

  function formatFilingPayloadApi<F extends FilingRecord>(
    business: BusinessData | BusinessDataPublic,
    filingName: FilingType,
    filingData: F,
    headerData: Partial<FilingHeaderSubmission> = {}
  ): FilingSubmissionBody<F> {
    return {
      filing: {
        header: {
          name: filingName,
          certifiedBy: authUser.value.fullName,
          accountId: useConnectAccountStore().currentAccount.id,
          date: getToday(),
          ...headerData
        },
        business: {
          identifier: business.identifier,
          foundingDate: business.foundingDate,
          legalName: business.legalName,
          legalType: business.legalType
        },
        ...filingData
      }
    }
  }

  /**
   * Restores the payment section of a form state from a saved draft header
   * @param opts `isStaff` defaults to the account type, `syncFees` to true
   */
  function hydratePaymentState(
    draftHeader: Partial<FilingHeaderResponse>,
    formState: { staffPayment?: StaffPaymentSchema, folio?: FolioSchema },
    opts: { syncFees?: boolean, isStaff?: boolean } = {}
  ) {
    const { syncFees = true, isStaff = useIsStaff().value } = opts
    if (isStaff) {
      formState.staffPayment = formatStaffPaymentUi(draftHeader as FilingHeaderResponse)
      if (syncFees) {
        feeStore.updateAllFees(
          !!formState.staffPayment.isPriority,
          formState.staffPayment.option === StaffPaymentOption.NO_FEE
        )
      }
    } else if (draftHeader.folioNumber) {
      formState.folio!.folioNumber = draftHeader.folioNumber
    }
  }

  /**
   * Saves a draft (POST or PUT) or submits a new filing (POST).
   * A draft is written whenever a draft already exists or the user is saving rather than
   * submitting - its id is recorded in the url so a reload resumes the same draft.
   * @returns the draft response when a draft was written, undefined when the filing was submitted
   */
  async function saveOrSubmitFiling<F extends FilingRecord>(
    businessId: string,
    payload: FilingSubmissionBody<F>,
    opts: { isSubmission: boolean, draftId?: string | number }
  ): Promise<FilingPutResponse<F> | FilingPostResponse<F> | undefined> {
    const { isSubmission, draftId } = opts
    if (draftId || !isSubmission) {
      const filingResp = await service.saveOrUpdateDraftFiling<F>(
        businessId,
        payload,
        isSubmission,
        draftId as string | number
      )
      const urlParams = useUrlSearchParams()
      urlParams.draft = String(filingResp.filing.header.filingId)
      return filingResp
    }

    await service.postFiling(businessId, payload)
    return undefined
  }

  return {
    formatFilingPayloadApi,
    getFilingName,
    hydratePaymentState,
    initFiling,
    saveOrSubmitFiling
  }
}
