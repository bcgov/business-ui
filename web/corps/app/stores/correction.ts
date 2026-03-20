import { cloneDeep } from 'es-toolkit'

export const useCorrectionStore = defineStore('correction-store', () => {
  const service = useBusinessService()
  const { tableState: tableParties } = useManageParties()
  const { tableState: tableReceivers } = useManageParties('manage-receivers')
  const { tableState: tableLiquidators } = useManageParties('manage-liquidators')
  const { tableState: tableOffices } = useManageOffices()
  const { tableState: tableShareClasses } = useManageShareStructure()
  const { formatAddressTableState, formatDraftTableState } = useBusinessAddresses()
  const { getPartiesMergedWithRelationships } = useBusinessParty()
  const { getCommonFilingPayloadData, initFiling } = useFiling()
  const businessApi = useBusinessApi()
  const businessStore = useBusinessStore()

  const initializing = ref<boolean>(false)
  const draftFilingState = shallowRef<CorrectionDraftState>({} as CorrectionDraftState)

  const formState = reactive<CorrectionFormSchema>({} as CorrectionFormSchema)
  const initialFormState = shallowRef<CorrectionFormSchema>({} as CorrectionFormSchema)
  const initialDirectors = shallowRef<TableBusinessState<PartySchema>[]>([])
  const initialReceivers = shallowRef<TableBusinessState<PartySchema>[]>([])
  const initialLiquidators = shallowRef<TableBusinessState<PartySchema>[]>([])
  const initialOffices = shallowRef<TableBusinessState<OfficesSchema>[]>([])
  const initialShareClasses = shallowRef<TableBusinessState<ShareClassSchema>[]>([])

  const correctionComment = computed({
    get: () => formState.comment ?? { detail: '' },
    set: (value) => {
      formState.comment = value
    }
  })

  const hasCommentChanges = computed(() => {
    const initialComment = initialFormState.value.comment?.detail?.trim() ?? ''
    const currentComment = formState.comment?.detail?.trim() ?? ''

    return currentComment !== initialComment
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
  const isStaff = computed(() => useConnectAccountStore().currentAccount.accountType === AccountType.STAFF)

  /**
   * Whether this is a "staff" type correction (no fee).
   * CLIENT corrections have a $20 fee, STAFF corrections have no fee.
   * This is determined by the `type` field in the pre-created correction draft.
   */
  const isStaffCorrectionType = computed(() => correctionType.value === CorrectionType.STAFF)

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
    initializing.value = true
    $reset()

    const { draftFiling, parties: allParties, addresses, shareClasses } = await initFiling<CorrectionFiling>(
      businessId,
      FilingType.CORRECTION,
      undefined,
      draftId,
      {}, // fetch all parties (no role filter) — 1 API call for directors, receivers, liquidators
      [OfficeType.RECORDS, OfficeType.REGISTERED],
      true // fetch share classes
    )

    // Filter the single parties response by role type (UI enum — data is already formatted)
    const parties = allParties?.filter(p => p.new.roles.some(r => r.roleType === RoleTypeUi.DIRECTOR))
    const receivers = allParties?.filter(p => p.new.roles.some(r => r.roleType === RoleTypeUi.RECEIVER))
    const liquidators = allParties?.filter(p => p.new.roles.some(r => r.roleType === RoleTypeUi.LIQUIDATOR))

    // The draft is always expected to exist (pre-created before page load)
    const draft = draftFiling?.filing?.correction
    if (draft) {
      draftFilingState.value = draftFiling

      // Correction metadata from the pre-created draft
      correctedFilingId.value = draft.correctedFilingId
      correctedFilingType.value = draft.correctedFilingType
      correctedFilingDate.value = draft.correctedFilingDate ?? ''
      correctionType.value = draft.type

      // Comment (may be empty on initial draft)
      formState.comment = { detail: draft.comment ?? '' }

      // Document delivery
      if (formState.documentDelivery) {
        formState.documentDelivery.completingPartyEmail = draft.contactPoint?.email ?? ''
      }

      // Header fields
      const header = draftFiling.filing.header
      formState.staffPayment = formatStaffPaymentUi(header)
      if (draft.courtOrder) {
        formState.courtOrder = formatCourtOrderUi(draft.courtOrder)
      }
      if (formState.certify) {
        formState.certify.legalName = header.certifiedBy ?? ''
      }

      // Completing party (client corrections only)
      if (draft.parties && formState.completingParty) {
        const cp = (draft.parties as Array<Record<string, unknown>>)?.find(
          (p: Record<string, unknown>) => {
            const roles = p.roles as Array<Record<string, string>>
            return roles?.some(r => r.roleType === 'completing_party')
          }
        )
        if (cp) {
          const officer = cp.officer as Record<string, string> | undefined
          formState.completingParty.firstName = officer?.firstName ?? ''
          formState.completingParty.middleName = officer?.middleName ?? ''
          formState.completingParty.lastName = officer?.lastName ?? ''
          if (cp.mailingAddress) {
            const addr = cp.mailingAddress as Record<string, string>
            formState.completingParty.mailingAddress = {
              street: addr.streetAddress ?? '',
              streetAdditional: addr.streetAddressAdditional ?? '',
              city: addr.addressCity ?? '',
              region: addr.addressRegion ?? '',
              postalCode: addr.postalCode ?? '',
              country: addr.addressCountry ?? '',
              locationDescription: addr.deliveryInstructions ?? ''
            }
          }
        }
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

    // Parties / Directors — use getPartiesMergedWithRelationships for clean merging
    if (parties) {
      const draftDirectorEntries = draftRelationships?.filter(
        dp => dp.roles?.some(r => r.roleType === RoleType.DIRECTOR)
      )
      tableParties.value = draftDirectorEntries?.length
        ? getPartiesMergedWithRelationships(parties, draftDirectorEntries)
        : parties
    }

    // Offices (corrections may include address changes)
    if (addresses) {
      if (draft?.offices) {
        // Draft offices are in ApiEntityOfficeAddress format — convert to table state
        // then merge with original addresses to detect and mark changes
        const draftOffices = formatAddressTableState(
          draft.offices as ApiEntityOfficeAddress,
          [OfficeType.RECORDS, OfficeType.REGISTERED]
        )
        tableOffices.value = formatDraftTableState(addresses, draftOffices)
      } else {
        tableOffices.value = addresses
      }
    }

    // Share structure
    if (shareClasses) {
      const originalClasses = formatShareClassesUi(shareClasses)

      if (draft?.shareStructure?.shareClasses?.length) {
        // Draft share classes may use singular `action` (e.g. "EDITED") from the API —
        // normalize to plural `actions` array with valid ActionType values before formatting.
        const normalizedClasses = draft.shareStructure.shareClasses.map((sc: Record<string, unknown>) => {
          const rawActions: string[] = (sc.actions as string[]) ?? (sc.action ? [sc.action as string] : [])
          const actions = rawActions.map(a =>
            Object.values(ActionType).includes(a as ActionType) ? a as ActionType : ActionType.CHANGED
          )
          return { ...sc, actions }
        })
        const draftClasses = formatShareClassesUi(normalizedClasses as unknown as ShareClass[])

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

        tableShareClasses.value = draftClasses
      } else {
        tableShareClasses.value = originalClasses
      }
    }

    // Receivers — merge with draft relationships if applicable
    if (receivers) {
      const draftReceiverEntries = draftRelationships?.filter(
        dp => dp.roles?.some(r => r.roleType === RoleType.RECEIVER)
      )
      tableReceivers.value = draftReceiverEntries?.length
        ? getPartiesMergedWithRelationships(receivers, draftReceiverEntries)
        : receivers
    }

    // Liquidators — merge with draft relationships if applicable
    if (liquidators) {
      const draftLiquidatorEntries = draftRelationships?.filter(
        dp => dp.roles?.some(r => r.roleType === RoleType.LIQUIDATOR)
      )
      tableLiquidators.value = draftLiquidatorEntries?.length
        ? getPartiesMergedWithRelationships(liquidators, draftLiquidatorEntries)
        : liquidators
    }

    await nextTick()
    initialFormState.value = cloneDeep(formState)
    initialDirectors.value = cloneDeep(tableParties.value)
    initialReceivers.value = cloneDeep(tableReceivers.value)
    initialLiquidators.value = cloneDeep(tableLiquidators.value)
    initialOffices.value = cloneDeep(tableOffices.value)
    initialShareClasses.value = cloneDeep(tableShareClasses.value)

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
    const regOffice = tableOffices.value.find(o => o.new.type === OfficeType.REGISTERED)?.new.address
    const recOffice = tableOffices.value.find(o => o.new.type === OfficeType.RECORDS)?.new.address

    const correctionPayload: CorrectionPayload = {
      comment: formState.comment?.detail ?? '',
      correctedFilingId: correctedFilingId.value!,
      correctedFilingType: correctedFilingType.value,
      correctedFilingDate: correctedFilingDate.value || undefined,
      type: correctionType.value,
      legalType: businessStore.business?.legalType as CorpTypeCd,

      // Parties — formatted as relationships (with `entity`), matching transition store pattern
      // All party types (directors, receivers, liquidators) are combined in one array
      relationships: [
        ...tableParties.value,
        ...tableReceivers.value,
        ...tableLiquidators.value
      ].map(entry => formatRelationshipApi(entry.new)),

      // Offices
      offices: {
        registeredOffice: formatOfficeApi(regOffice),
        recordsOffice: formatOfficeApi(recOffice)
      } as unknown as ApiEntityOfficeAddress,

      // Share structure
      shareStructure: {
        shareClasses: formatShareClassesApi(tableShareClasses.value, isSubmission)
      },

      // Court order (common filing data)
      ...getCommonFilingPayloadData(formState.courtOrder),

      // Document delivery / contact point
      ...(formState.documentDelivery?.completingPartyEmail && {
        contactPoint: { email: formState.documentDelivery.completingPartyEmail }
      }),

      // Completing party (client corrections)
      ...(formState.completingParty?.lastName && {
        parties: [
          {
            officer: {
              firstName: formState.completingParty.firstName,
              middleName: formState.completingParty.middleName || undefined,
              lastName: formState.completingParty.lastName
            },
            mailingAddress: formatAddressApi(formState.completingParty.mailingAddress),
            roles: [{ roleType: 'completing_party', appointmentDate: getToday('America/Vancouver') }]
          }
        ]
      })

      // TODO: add nameRequest, nameTranslations, startDate, provisionsRemoved
      // as correction sections are implemented in the UI
    }

    const filingPayload = businessApi.createFilingPayload(
      businessStore.business!,
      FilingType.CORRECTION,
      { correction: correctionPayload },
      {
        ...formatStaffPaymentApi(formState.staffPayment!),
        ...(formState.certify?.legalName ? { certifiedBy: formState.certify.legalName } : {})
      }
    )

    // Draft is always pre-created, so we always have a filingId to update
    const filingId = draftFilingState.value?.filing?.header?.filingId
    if (filingId) {
      const filingResp = await businessApi.saveOrUpdateDraftFiling<CorrectionFiling>(
        businessStore.businessIdentifier!,
        filingPayload,
        isSubmission,
        filingId
      )
      draftFilingState.value = filingResp as unknown as CorrectionDraftState
    } else {
      // Fallback: post new filing (should not happen in normal flow)
      await businessApi.postFiling(businessStore.businessIdentifier!, filingPayload)
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
    formState.activeOffice = undefined
    formState.activeClass = undefined
    formState.activeSeries = undefined


    initialFormState.value = cloneDeep(formState)
    initialDirectors.value = []
    initialReceivers.value = []
    initialLiquidators.value = []
    initialOffices.value = []
    initialShareClasses.value = []
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
    directors: tableParties,
    receivers: tableReceivers,
    liquidators: tableLiquidators,
    offices: tableOffices,
    shareClasses: tableShareClasses,
    initialFormState,
    initialDirectors,
    initialReceivers,
    initialLiquidators,
    initialOffices,
    initialShareClasses,
    hasCommentChanges,
    isStaff,
    init,
    submit,
    $reset
  }
})
