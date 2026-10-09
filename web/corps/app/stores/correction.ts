/* eslint-disable max-len */
import { cloneDeep } from 'es-toolkit'

export const useCorrectionStore = defineStore('correction-store', () => {
  const service = useBusinessService()
  const { getPartiesMergedWithRelationships } = useBusinessParty()
  const { getCommonFilingPayloadData, initFiling, createFilingPayload } = useFiling()
  const businessStore = useBusinessStore()

  const {
    amalgamation,
    amalStmnt,
    courtOrders,
    directors,
    receivers,
    liquidators,
    custodians,
    offices,
    shareClasses,
    resolutionDates,
    nameTranslations,
    yourCompany,
    hasNameTranslationChange,
    hasOfficeChange,
    hasShareStructureChange
  } = useCorrectionHelper()

  const initializing = ref<boolean>(false)
  const draftFilingState = shallowRef<CorrectionDraftState>({} as CorrectionDraftState)
  const businessExtended = shallowRef<BusinessDataExtended | undefined>({})

  const formState = reactive<CorrectionFormSchema>({} as CorrectionFormSchema)
  const initialFormState = shallowRef<CorrectionFormSchema>({} as CorrectionFormSchema)
  const initialDirectors = shallowRef<TableBusinessState<PartySchema>[]>([])
  const initialReceivers = shallowRef<TableBusinessState<PartySchema>[]>([])
  const initialLiquidators = shallowRef<TableBusinessState<PartySchema>[]>([])
  const initialCustodians = shallowRef<TableBusinessState<PartySchema>[]>([])
  const initialOffices = shallowRef<TableBusinessState<OfficesSchema>[]>([])
  const initialShareClasses = shallowRef<TableBusinessState<ShareClassSchema>[]>([])
  const initialNameTranslations = shallowRef<TableBusinessState<NameTranslationSchema>[]>([])
  const initialResolutionDates = shallowRef<TableBusinessState<ResolutionDateSchema>[]>([])
  const initialCourtOrders = shallowRef<TableBusinessState<CourtOrderPoaFullSchema>[]>([])
  const initialAmalgamation = shallowRef<TableBusinessState<AmalgamationTableRow>[]>([])
  const initialAmalStmnt = shallowRef<TableBusinessState<AmalgamationCorrectStatementSchema>>({} as TableBusinessState<AmalgamationCorrectStatementSchema>)

  const correctionComment = computed({
    get: () => formState.comment ?? { detail: '' },
    set: (value) => {
      formState.comment = value
    }
  })

  /** The original filing being corrected (fetched by correctedFilingId) */
  const correctedFiling = shallowRef<FilingGetByIdResponse<FilingRecord> | undefined>(undefined)

  /** Metadata about the filing being corrected */
  const correctedFilingId = ref<number | undefined>(undefined)
  const correctedFilingType = ref<FilingType>(FilingType.UNKNOWN)
  const correctedFilingDate = ref<string>('') // YYYY-MM-DD
  const correctionType = ref<CorrectionType>(CorrectionType.CLIENT)

  const correctedFilingDateDisplay = computed(() => {
    return correctedFilingDate.value ? toReadableDate(correctedFilingDate.value) : undefined
  })

  /** Whether the current user is staff (all correction filers are staff) */
  const isStaff = useIsStaff()

  /**
   * Whether this is a "staff" type correction (no fee).
   * CLIENT corrections have a $20 fee, STAFF corrections have no fee.
   * This is determined by the `type` field in the pre-created correction draft.
   */
  const isStaffCorrectionType = computed(() => correctionType.value === CorrectionType.STAFF)

  /** Subtype of the filing being corrected (e.g. the type of dissolution, amalgamation or change of liquidators) */
  const correctedFilingSubType = computed(() => {
    const filingData = correctedFiling.value?.filing[correctedFilingType.value]
    return (filingData?.type ?? filingData?.dissolutionType) as string | undefined
  })

  /** Sections that can be corrected for the filing being corrected */
  const correctableSections = computed(() =>
    getCorrectableSections(correctedFilingType.value, correctedFilingSubType.value)
  )

  /** Whether the given section can be corrected for the filing being corrected */
  function isCorrectable(section: CorrectionSection): boolean {
    return correctableSections.value.includes(section)
  }

  /**
   * Initialize the correction store.
   *
   * A correction draft is pre-created before navigating to this page.
   * The route param `filingId` is the draft correction's filing ID.
   * The `correctedFilingId` (the original filing being corrected) comes from
   * inside the draft's correction payload.
   *
   * Note: useFilingPageWatcher calls init(businessId, draftId) when there is no
   * filingSubType, so draftId must be the second parameter (matching InitFiling type).
   *
   * @param businessId - The business identifier (e.g. 'BC1230099')
   * @param draftId - The pre-created correction draft filing ID (from route param `filingId`)
   */
  async function init(businessId: string, draftId?: string) {
    $reset()
    initializing.value = true

    const { draftFiling, parties: allParties, shareClasses: shareClassData } = await initFiling<CorrectionFiling>(
      businessId,
      FilingType.CORRECTION,
      undefined,
      draftId,
      { all: true }, // fetch all parties incl. ceased (no role filter) — 1 API call for directors, receivers, liquidators
      undefined,
      true // fetch share classes
    )

    if (!draftFiling) {
      initializing.value = false
      return
    }

    const [
      addressData,
      aliasesNameTranslations,
      courtOrderData,
      businessExtendedData
    ] = await Promise.all([
      service.getAddresses(businessId).catch(() => undefined),
      service.getNameTranslations(businessId).catch(() => [] as NameTranslation[]),
      service.getCourtOrders(businessId).catch(() => [] as CourtOrderResponse[]),
      service.getBusinessExtended(businessId, true).catch(() => undefined)
    ])

    // The draft is always expected to exist (pre-created before page load)
    const draft = draftFiling.filing.correction
    draftFilingState.value = draftFiling

    // Correction metadata from the pre-created draft
    correctedFilingId.value = draft.correctedFilingId
    correctedFilingType.value = draft.correctedFilingType
    correctedFilingDate.value = draft.correctedFilingDate ?? ''
    correctionType.value = draft.type

    // Set business extended data (Used for amalgamationApplication, amalgamationOut, coninuationOut or continuationIn corrections)
    businessExtended.value = businessExtendedData

    // Filter the single parties response by role type (UI enum — data is already formatted)
    const directorData = allParties?.filter(p => p.new.roles.some(r => r.roleType === RoleTypeUi.DIRECTOR))
    // `all: true` also returns ceased parties — only directors keep their ceased parties (ManageParties shows them in a ceased tab)
    const hasActiveRole = (p: TableBusinessState<PartySchema>, roleType: RoleTypeUi) =>
      p.new.roles.some(r => r.roleType === roleType && !r.cessationDate)
    const receiverData = allParties?.filter(p => hasActiveRole(p, RoleTypeUi.RECEIVER))
    const liquidatorData = allParties?.filter(p => hasActiveRole(p, RoleTypeUi.LIQUIDATOR))
    const custodianData = allParties?.filter(p => hasActiveRole(p, RoleTypeUi.CUSTODIAN))

    // Comment (may be empty on initial draft)
    formState.comment = { detail: draft.comment ?? '' }

    // Document delivery
    if (formState.documentDelivery) {
      formState.documentDelivery.completingPartyEmail = draft.contactPoint?.email ?? ''
    }

    // Header fields
    const header = draftFiling!.filing.header
    formState.staffPayment = formatStaffPaymentUi(header)
    if (draft.courtOrder) {
      formState.courtOrder = formatCourtOrderUi(draft.courtOrder)
    }

    // Completing party (client corrections only) — read from relationships (new format)
    // The draft may contain multiple relationships with a "Completing Party" role:
    // one from the original filing (e.g. an incorporator who was also the completing party)
    // and one ADDED during this correction. We want the ADDED one.
    const draftAllRelationships = draft?.relationships as BusinessRelationship[] | undefined
    if (draftAllRelationships && formState.completingParty) {
      const cpRelationship = draftAllRelationships.find(
        r => r.roles?.some(role => role.roleType === RoleType.COMPLETING_PARTY)
          && r.actions?.includes(ActionType.ADDED)
      )
      if (cpRelationship) {
        Object.assign(formState.completingParty, formatCompletingPartyRelationshipUi(cpRelationship))
      }
    }

    // Fetch the original corrected filing for display (original filing date, type, etc.)
    if (correctedFilingId.value) {
      try {
        const originalFiling = await service.getFiling(businessId, correctedFilingId.value)
        if (originalFiling) {
          correctedFiling.value = originalFiling as FilingGetByIdResponse<FilingRecord>
        }
      } catch {
        // Original filing fetch is non-blocking — correction can still proceed
        console.warn(`Could not fetch corrected filing ${correctedFilingId.value}`)
      }
    }

    // Draft relationships from the pre-created correction draft (new format with `entity`)
    const draftRelationships = draft?.relationships as BusinessRelationship[] | undefined

    // Directors — use getPartiesMergedWithRelationships for clean merging
    if (directorData) {
      const draftDirectorEntries = draftRelationships?.filter(
        dp => dp.roles?.some(r => r.roleType === RoleType.DIRECTOR)
      )
      directors.value = draftDirectorEntries?.length
        ? getPartiesMergedWithRelationships(directorData, draftDirectorEntries)
        : directorData
    }

    // Offices (corrections may include address changes)
    offices.value = formatOfficesSection(addressData, draft?.offices)

    // Share structure
    if (shareClassData) {
      const originalClasses = formatShareClassesUi(shareClassData)

      if (draft?.shareStructure?.shareClasses?.length) {
        // Draft share classes may use singular `action` (e.g. "EDITED") from the API —
        // normalize to plural `actions` array with valid ActionType values before formatting.
        const normalizedClasses = draft.shareStructure.shareClasses.map((sc) => {
          const rawActions: string[] = (sc.actions as string[]) ?? (sc.action ? [sc.action as string] : [])
          const actions = rawActions.map(a =>
            Object.values(ActionType).includes(a as ActionType) ? a as ActionType : ActionType.CHANGED
          )
          return { ...sc, actions }
        })

        const draftClasses = formatShareClassesUi(normalizedClasses)

        // Merge draft share classes with originals to preserve old/new state for diffing
        for (const shareClass of draftClasses) {
          const classId = shareClass.new.id
          const existingClass = classId
            ? originalClasses.find(c => c.new.id === classId)
            : undefined

          if (existingClass) {
            shareClass.old = existingClass.new
          } else {
            shareClass.old = undefined
          }
        }

        shareClasses.value = draftClasses
      } else {
        shareClasses.value = originalClasses
      }
    }

    const originalResolutions = await service.getResolutions(businessId).catch(() => [])
    const draftResolutions = draft.shareStructure?.resolutionDates

    const { newState, tableState } = formatResolutionDatesSection(originalResolutions, draftResolutions)

    formState.resolutionDate = cloneDeep(newState)
    resolutionDates.value = cloneDeep(tableState)

    // Receivers — merge with draft relationships if applicable
    if (receiverData) {
      const draftReceiverEntries = draftRelationships?.filter(
        dp => dp.roles?.some(r => r.roleType === RoleType.RECEIVER)
      )
      receivers.value = draftReceiverEntries?.length
        ? getPartiesMergedWithRelationships(receiverData, draftReceiverEntries)
        : receiverData
    }

    // Liquidators — merge with draft relationships if applicable
    if (liquidatorData) {
      const draftLiquidatorEntries = draftRelationships?.filter(
        dp => dp.roles?.some(r => r.roleType === RoleType.LIQUIDATOR)
      )
      liquidators.value = draftLiquidatorEntries?.length
        ? getPartiesMergedWithRelationships(liquidatorData, draftLiquidatorEntries)
        : liquidatorData
    }

    // Custodians — merge with draft relationships if applicable
    if (custodianData) {
      const draftCustodianEntries = draftRelationships?.filter(
        dp => dp.roles?.some(r => r.roleType === RoleType.CUSTODIAN)
      )
      custodians.value = draftCustodianEntries?.length
        ? getPartiesMergedWithRelationships(custodianData, draftCustodianEntries)
        : custodianData
    }

    // Name translations — convert API format to table state, merge with draft if applicable
    if (aliasesNameTranslations.length) {
      const originalTableState = mapOriginalNameTranslations(aliasesNameTranslations)

      if (draft?.nameTranslations?.length) {
        nameTranslations.value = mergeDraftNameTranslations(originalTableState, draft.nameTranslations)
      } else {
        nameTranslations.value = originalTableState
      }
    } else if (draft?.nameTranslations?.length) {
      // No existing translations, but draft has new ones
      nameTranslations.value = mapDraftOnlyNameTranslations(draft.nameTranslations)
    }

    // set `Your Company` data
    const draftYourCompanyData = {
      continuationIn: draft.continuationIn,
      continuationOut: draft.continuationOut,
      amalgamationOut: draft.amalgamationOut,
      nameRequest: draft.nameRequest
    }

    yourCompany.value = formatYourCompanySection(
      businessStore.business,
      businessExtendedData,
      draftYourCompanyData,
      correctedFilingType.value
    )

    const formattedCourtOrders = formatCourtOrdersSection(courtOrderData, draft.courtOrders)
    courtOrders.value = formattedCourtOrders

    if (businessExtendedData?.amalgamation) {
      const formattedAmalgamation = formatAmalCorrectSection(businessExtendedData.amalgamation, draft.amalgamation)
      amalgamation.value = formattedAmalgamation.tableState
      amalStmnt.value = formattedAmalgamation.statementState
    }

    await nextTick()
    initialFormState.value = cloneDeep(formState)
    initialDirectors.value = cloneDeep(directors.value)
    initialReceivers.value = cloneDeep(receivers.value)
    initialLiquidators.value = cloneDeep(liquidators.value)
    initialCustodians.value = cloneDeep(custodians.value)
    initialOffices.value = cloneDeep(offices.value)
    initialShareClasses.value = cloneDeep(shareClasses.value)
    initialNameTranslations.value = cloneDeep(nameTranslations.value)
    initialResolutionDates.value = cloneDeep(resolutionDates.value)
    initialCourtOrders.value = cloneDeep(courtOrders.value)
    initialAmalgamation.value = cloneDeep(amalgamation.value)
    initialAmalStmnt.value = cloneDeep(amalStmnt.value)

    // Fee: STAFF type corrections = no fee, CLIENT type corrections = $20 (CRCTN fee code)
    if (isStaffCorrectionType.value) {
      const feeStore = useConnectFeeStore()
      feeStore.updateAllFees(false, true) // (priority: false, waived: true)
    }

    initializing.value = false
  }

  /**
   * Build and submit (or save as draft) the correction filing.
   *
   * @param isSubmission - true to submit for processing, false to save as draft
   */
  async function submit(isSubmission: boolean) {
    const regOffice = offices.value.find(o => o.new.type === OfficeType.REGISTERED)?.new.address
    const recOffice = offices.value.find(o => o.new.type === OfficeType.RECORDS)?.new.address

    const correctionPayload: CorrectionPayload = {
      comment: formState.comment?.detail ?? '',
      correctedFilingId: correctedFilingId.value!,
      correctedFilingType: correctedFilingType.value,
      correctedFilingDate: correctedFilingDate.value || undefined,
      type: correctionType.value,
      legalType: businessStore.business?.legalType as CorpTypeCd,

      // Parties — formatted as relationships (with `entity`), matching transition store pattern
      // All party types (directors, receivers, liquidators, completing party) are combined in one array
      // Only parties in sections correctable for the corrected filing are included
      // (e.g. a voluntary dissolution correction sends custodians but not directors)
      relationships: [
        ...(isCorrectable(CorrectionSection.DIRECTORS) ? directors.value : []),
        ...(isCorrectable(CorrectionSection.RECEIVERS) ? receivers.value : []),
        ...(isCorrectable(CorrectionSection.LIQUIDATORS) ? liquidators.value : []),
        ...(isCorrectable(CorrectionSection.CUSTODIANS) ? custodians.value : [])
      ].map(entry => formatRelationshipApi(entry.new)).concat(
        // Completing party (client corrections) — submitted as a relationship
        formState.completingParty?.lastName
          ? [formatCompletingPartyRelationshipApi(formState.completingParty)]
          : []
      ),

      // Offices
      ...(isCorrectable(CorrectionSection.OFFICES) && hasOfficeChange.value && {
        offices: {
          registeredOffice: formatOfficeApi(regOffice),
          recordsOffice: formatOfficeApi(recOffice)
        } as unknown as ApiEntityOfficeAddress
      }),

      // Share structure
      ...(isCorrectable(CorrectionSection.SHARE_STRUCTURE) && hasShareStructureChange.value && {
        shareStructure: {
          shareClasses: formatShareClassesApi(shareClasses.value, isSubmission),
          resolutionDates: formatResolutionDatesApi(resolutionDates.value)
        }
      }),

      // Court order (common filing data)
      ...getCommonFilingPayloadData(formState.courtOrder),

      // Document delivery / contact point
      // contactPoint is always required, use completing party email if submitted else use
      // business contact from auth
      contactPoint: {
        email: formState.documentDelivery?.completingPartyEmail || businessStore.businessContact?.email || '',
        phone: businessStore.businessContact?.phone || '',
        // FUTURE: fix typing
        ...(businessStore.businessContact?.extension
          ? { extension: Number(businessStore.businessContact?.extension) as unknown as string }
          : {}
        )
      },

      // Name translations — match CorrectionPayload interface:
      // - id: only for existing entries (real API id); omitted for new entries (avoids sending temp UUIDs)
      // - name: the corrected/effective name
      // - oldName: only when the name was actually changed
      // - action: the correction action
      ...(isCorrectable(CorrectionSection.YOUR_COMPANY) && hasNameTranslationChange.value && {
        nameTranslations: nameTranslations.value
          .filter(nt => nt.new.actions.length > 0)
          .map(nt => ({
            ...(nt.old ? { id: nt.new.id } : {}),
            name: nt.new.name,
            ...(nt.old && nt.old.name !== nt.new.name ? { oldName: nt.old.name } : {}),
            action: nt.new.actions[0]
          }))
      }),

      ...(isCorrectable(CorrectionSection.COURT_ORDERS) && {
        courtOrders: formatCourtOrdersApi(courtOrders.value)
      }),

      ...(isCorrectable(CorrectionSection.AMALGAMATION) && {
        amalgamation: formatAmalCorrectApi(amalgamation.value, amalStmnt.value)
      }),

      ...(isCorrectable(CorrectionSection.YOUR_COMPANY)
        && formatCorrectYourCompanyApi(yourCompany.value, businessExtended.value, correctedFilingType.value))
      // TODO: startDate, provisionsRemoved
      // as correction sections are implemented in the UI
    }

    const headerPayload = {
      ...formatStaffPaymentApi(formState.staffPayment!),
      authorizationReceived: Boolean(formState.authorization?.isAuthorized)
    }

    const filingPayload = createFilingPayload(
      businessStore.business!,
      FilingType.CORRECTION,
      { correction: correctionPayload },
      headerPayload
    )

    const header = filingPayload.filing.header as Record<string, unknown>
    // remove certifiedBy and authorizationReceived from header if not a submission (i.e. if saving as draft)
    if (!isSubmission) {
      delete header.certifiedBy
      delete header.authorizationReceived
    }

    // Draft is always pre-created, so we always have a filingId to update
    const filingId = draftFilingState.value?.filing?.header?.filingId
    if (filingId) {
      const filingResp = await service.saveOrUpdateDraftFiling<CorrectionFiling>(
        businessStore.businessIdentifier!,
        filingPayload,
        isSubmission,
        filingId
      )
      draftFilingState.value = filingResp as unknown as CorrectionDraftState
    } else {
      // Fallback: post new filing (should not happen in normal flow)
      await service.postFiling(businessStore.businessIdentifier!, filingPayload)
    }
  }

  function syncResolutionTableState(isReview: boolean) {
    const addedDate = formState.resolutionDate

    if (!isReview) {
      if (addedDate?.id) {
        resolutionDates.value = resolutionDates.value.filter(
          rd => rd.new.id !== addedDate.id
        )
      }
      return
    }

    // Only treat the add-resolution-date placeholder as a real addition once a date has
    // actually been entered — the form marks it ActionType.ADDED as soon as it mounts
    // (see Form/Share/ResolutionDate), so an untouched placeholder must not be synced in.
    if (!addedDate?.date) {
      return
    }

    const existingIndex = resolutionDates.value.findIndex(rd => rd.new.id === addedDate.id)

    if (existingIndex > -1) {
      resolutionDates.value[existingIndex] = { old: undefined, new: cloneDeep(addedDate) }
    } else {
      resolutionDates.value.unshift({ old: undefined, new: cloneDeep(addedDate) })
    }
  }

  function $reset() {
    correctedFilingId.value = undefined
    correctedFilingType.value = FilingType.UNKNOWN
    correctedFilingDate.value = ''
    correctionType.value = CorrectionType.CLIENT
    correctedFiling.value = undefined

    const defaults = getCorrectionSchema(isStaffCorrectionType.value).parse({})
    Object.assign(formState, defaults)
    formState.activeDirector = undefined
    formState.activeReceiver = undefined
    formState.activeLiquidator = undefined
    formState.activeCustodian = undefined
    formState.activeOffice = undefined
    formState.activeClass = undefined
    formState.activeSeries = undefined
    formState.activeNameTranslation = undefined
    formState.activeResolutionDate = undefined
    formState.activeCourtOrder = undefined
    formState.activeAmal = undefined
    formState.activeAmalStmnt = undefined

    nameTranslations.value = []

    initialFormState.value = cloneDeep(formState)
    initialDirectors.value = []
    initialReceivers.value = []
    initialLiquidators.value = []
    initialCustodians.value = []
    initialOffices.value = []
    initialShareClasses.value = []
    initialNameTranslations.value = []
    initialResolutionDates.value = []
    initialCourtOrders.value = []
    initialAmalgamation.value = []
    initialAmalStmnt.value = {} as TableBusinessState<AmalgamationCorrectStatementSchema>

    initializing.value = false
  }

  return {
    formState,
    correctionComment,
    initializing,
    correctedFiling,
    correctedFilingId,
    correctedFilingType,
    correctedFilingDate,
    correctedFilingDateDisplay,
    correctionType,
    isStaffCorrectionType,
    correctedFilingSubType,
    correctableSections,
    isCorrectable,
    courtOrders,
    directors,
    receivers,
    liquidators,
    custodians,
    offices,
    shareClasses,
    resolutionDates,
    nameTranslations,
    amalgamation,
    amalStmnt,
    initialFormState,
    initialDirectors,
    initialReceivers,
    initialLiquidators,
    initialCustodians,
    initialOffices,
    initialShareClasses,
    initialResolutionDates,
    initialNameTranslations,
    initialCourtOrders,
    initialAmalgamation,
    initialAmalStmnt,
    isStaff,
    init,
    submit,
    syncResolutionTableState,
    $reset
  }
})
