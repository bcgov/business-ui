import { getFilingName } from '#business/app/utils/get-filing-name'

export const useFiling = () => {
  const { t, te } = useNuxtApp().$i18n
  const service = useBusinessService()
  const { setFilingDefault } = useBusinessTombstone()
  const { getBusinessParties, getPartiesMergedWithRelationships } = useBusinessParty()
  const businessStore = useBusinessStore()
  const feeStore = useConnectFeeStore()
  const modal = useFilingModals()
  const permissionsStore = useBusinessPermissionsStore()
  const { authUser } = useConnectAuth()
  const rebase = useDraftRebase()

  /**
   * Everything a filing page needs, with the draft's common sections already merged.
   * - requested section: fetched fresh, merged with its one canonical formatter
   * - row changed by a staff filing: badged (useDraftRebase)
   * - filing-specific fields: hydrated by the store from `draftBody`
   */
  async function initFiling<T extends FilingRecord>(
    businessId: string,
    filingName: FilingType,
    options: InitFilingOptions = {}
  ): Promise<InitFilingResult<T>> {
    const { filingSubType, draftId, parties: partiesParams, offices: officeTypes } = options
    try {
      // throw error and show modal if invalid business ID
      if (businessId === 'undefined') {
        throw createError({ statusCode: 404 })
      }

      rebase.$reset()
      // a resumed draft is rebased onto the business as it is now - defeat the query cache
      const force = !!draftId

      const draftPromise = draftId
        ? service.getAndValidateDraftFiling<T>(businessId, draftId, filingName, force)
          .catch(() => { throw new Error('invalid-draft-filing') }) // special case for loading drafts in initFiling - changes TBD
        : undefined

      const partiesPromise = partiesParams
        ? getBusinessParties(
          businessId,
          partiesParams.roleClass,
          partiesParams.roleType,
          partiesParams.all,
          partiesParams.date,
          force
        )
        : undefined

      const addressesPromise = officeTypes
        ? service.getAddresses(businessId, undefined, force)
        : undefined

      const shareClassesPromise = options.shareClasses
        ? service.getShareClasses(businessId, undefined, force)
        : undefined

      const nameTranslationsPromise = options.nameTranslations
        ? service.getNameTranslations(businessId, force)
        : undefined

      const resolutionsPromise = options.resolutions
        ? service.getResolutions(businessId, false, force)
        : undefined

      const [
        _tombstoneInit,
        _businessInit,
        draftFiling,
        parties,
        _permissions,
        apiAddresses,
        shareClasses,
        nameTranslations,
        resolutions
      ] = await Promise.all([
        setFilingDefault(businessId, false),
        businessStore.init(businessId, false, false, force, true),
        draftPromise,
        partiesPromise,
        permissionsStore.init(businessId),
        addressesPromise,
        shareClassesPromise,
        nameTranslationsPromise,
        resolutionsPromise
      ])

      // changed-wins conflict resolution before the draft is merged
      const resolvedDraft = draftFiling && draftId
        ? await rebase.resolveDraftFiling(businessId, draftId, draftFiling, filingName, { shareClasses, resolutions })
        : draftFiling
      const draftBody = (resolvedDraft?.filing as Record<string, unknown> | undefined)?.[filingName] as
        InitFilingResult<T>['draftBody']

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
        draftFiling: resolvedDraft,
        draftBody,
        parties: mergeParties(parties, draftBody?.relationships),
        addresses: apiAddresses === undefined
          ? undefined
          : rebase.markStaffModified(
            formatOfficesSection(
              apiAddresses,
              options.mergeDraftOffices === false ? undefined : draftBody?.offices,
              officeTypes
            ),
            'offices'
          ),
        shareClasses: shareClasses === undefined
          ? undefined
          : rebase.markStaffModified(
            formatShareClassesSection(shareClasses, draftBody?.shareStructure?.shareClasses),
            'shareClasses'
          ),
        nameTranslations: nameTranslations === undefined
          ? undefined
          : rebase.markStaffModified(
            formatNameTranslationsSection(nameTranslations, draftBody?.nameTranslations),
            'nameTranslations'
          ),
        resolutions: resolutions === undefined
          ? undefined
          : mergeResolutions(resolutions, draftBody?.shareStructure?.resolutionDates)
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
        draftBody: undefined,
        parties: undefined,
        addresses: undefined,
        shareClasses: undefined,
        nameTranslations: undefined,
        resolutions: undefined
      }
    }
  }

  /** Draft party rows merge over the current rows by id (new rows appended); staff-changed rows are badged */
  function mergeParties(
    parties: TableBusinessState<PartySchema>[] | undefined,
    draftRelationships: BusinessRelationship[] | undefined
  ) {
    if (!parties) {
      return undefined
    }
    rebase.markStaffModified(parties, 'parties')
    return draftRelationships ? getPartiesMergedWithRelationships(parties, draftRelationships) : parties
  }

  function mergeResolutions(resolutions: Resolution[], draftDates: Resolution[] | undefined) {
    const { newState, tableState } = formatResolutionDatesSection(resolutions, draftDates)
    return { newState, tableState: rebase.markStaffModified(tableState, 'resolutions') }
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
   * - existing draft, or a save: draft written
   * - draft id: synced to the url for reload (`syncUrlDraftParam: false` on route-param pages)
   * @returns the draft response when a draft was written, undefined when the filing was submitted
   */
  async function saveOrSubmitFiling<F extends FilingRecord>(
    businessId: string,
    payload: FilingSubmissionBody<F>,
    opts: { isSubmission: boolean, draftId?: string | number, syncUrlDraftParam?: boolean }
  ): Promise<FilingPutResponse<F> | FilingPostResponse<F> | undefined> {
    const { isSubmission, draftId, syncUrlDraftParam = true } = opts
    if (draftId || !isSubmission) {
      const filingResp = draftId
        ? await putFilingWithRebase<F>(businessId, payload, isSubmission, draftId)
        : await service.saveOrUpdateDraftFiling<F>(businessId, payload, isSubmission, draftId as string | number)
      if (syncUrlDraftParam) {
        const urlParams = useUrlSearchParams()
        urlParams.draft = String(filingResp.filing.header.filingId)
      }
      return filingResp
    }

    await service.postFiling(businessId, payload)
    return undefined
  }

  /**
   * PUT carrying the rebase base of a resumed draft.
   * - 409 (a filing completed since the form loaded): the work is kept as a draft at the old base
   * - 409 on a submission: parked as a draft, error rethrown so stale data is never filed
   */
  async function putFilingWithRebase<F extends FilingRecord>(
    businessId: string,
    payload: FilingSubmissionBody<F>,
    isSubmission: boolean,
    draftId: string | number
  ): Promise<FilingPutResponse<F>> {
    const rebaseOpts = rebase.getSaveOptions(isSubmission)
    if (!rebaseOpts) {
      return service.saveOrUpdateDraftFiling<F>(businessId, payload, isSubmission, draftId)
    }
    try {
      return await service.saveOrUpdateDraftFiling<F>(businessId, payload, isSubmission, draftId, rebaseOpts)
    } catch (error) {
      if (getErrorStatus(error) !== 409) {
        throw error
      }
      rebase.markStaleOnSave()
      const draftSave = service.saveOrUpdateDraftFiling<F>(businessId, payload, false, draftId)
      if (isSubmission) {
        await draftSave.catch(() => undefined)
        throw error
      }
      return draftSave
    }
  }

  return {
    formatFilingPayloadApi,
    getFilingName,
    hydratePaymentState,
    initFiling,
    saveOrSubmitFiling
  }
}
