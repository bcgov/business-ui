import { cloneDeep } from 'es-toolkit'

export const useCorrectionStore = defineStore('correction-store', () => {
  const service = useBusinessService()
  const { tableState: tableParties } = useManageParties()
  const { tableState: tableReceivers } = useManageParties('manage-receivers')
  const { tableState: tableLiquidators } = useManageParties('manage-liquidators')
  const { tableState: tableOffices } = useManageOffices()
  const { tableState: tableShareClasses } = useManageShareStructure()
  const { formatAddressTableState, formatDraftTableState } = useBusinessAddresses()
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

  /** The original filing being corrected (fetched by correctedFilingId) */
  const correctedFiling = shallowRef<FilingGetByIdResponse<FilingRecord> | undefined>(undefined)

  /** Metadata about the filing being corrected */
  const correctedFilingId = ref<number | undefined>(undefined)
  const correctedFilingType = ref<FilingType>(FilingType.UNKNOWN)
  const correctedFilingDate = ref<string>('') // YYYY-MM-DD
  const correctionType = ref<CorrectionType>(CorrectionType.CLIENT)

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

    const { draftFiling, parties: allParties, addresses } = await initFiling<CorrectionFiling>(
      businessId,
      FilingType.CORRECTION,
      undefined,
      draftId,
      {}, // fetch all parties (no role filter) — 1 API call for directors, receivers, liquidators
      [OfficeType.RECORDS, OfficeType.REGISTERED]
    )

    // Fetch share classes for the business
    const classes = await service.getShareClasses(businessId)

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
      formState.comment = draft.comment ?? ''

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
      if (formState.folio) {
        formState.folio.folioNumber = header.folioNumber ?? ''
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

    // Normalize actions from the API that don't match our ActionType enum.
    // The API may return values like "EDITED" — map these to the closest valid ActionType.
    // Display-level overrides (e.g. showing "CORRECTED" badge text) are handled by labelOverrides.
    function normalizeApiActions(actions: (string | ActionType)[]): ActionType[] {
      return actions.map((a) => {
        if (Object.values(ActionType).includes(a as ActionType)) {
          return a as ActionType
        }
        // Map unknown API values to CHANGED as a safe fallback
        return ActionType.CHANGED
      })
    }

    // Parties / Directors
    if (parties) {
      if (draft?.parties?.length) {
        // Draft parties are in OrgPerson format — format them to PartySchema,
        // then merge with the original fetched parties so that:
        //   - existing parties are updated with draft changes (matched by officer.id)
        //   - new parties from draft are added
        //   - actions from the draft (e.g. "ADDRESS_CHANGED") are preserved as-is
        //
        // Filter to only include parties that have a Director role —
        // the draft includes ALL parties (e.g. Completing Party) but
        // the directors table only shows directors.
        const draftDirectors = draft.parties.filter(
          dp => dp.roles?.some(r => r.roleType === RoleType.DIRECTOR)
        )
        const draftPartiesFormatted: TableBusinessState<PartySchema>[] = draftDirectors.map((dp) => {
          const formatted = formatPartyUi(dp, RoleType.DIRECTOR)
          // Normalize actions from the draft (e.g. "EDITED" → valid ActionType)
          formatted.actions = normalizeApiActions(dp.actions ?? [])
          return { new: formatted, old: undefined }
        })

        // Start with the original business parties, then overlay draft changes
        const merged = [...parties]
        for (const draftEntry of draftPartiesFormatted) {
          const draftId = draftEntry.new.id
          const existingIdx = draftId
            ? merged.findIndex(p => p.new.id === draftId)
            : -1

          if (existingIdx >= 0) {
            // Preserve the old (original) state and apply the draft as the new state
            merged[existingIdx] = {
              new: draftEntry.new,
              old: { ...merged[existingIdx]!.new }
            }
          } else {
            // New party added in the correction draft
            merged.push(draftEntry)
          }
        }
        tableParties.value = merged
      } else {
        tableParties.value = parties
      }
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
        const mergedOffices = formatDraftTableState(addresses, draftOffices)
        // Normalize actions (e.g. ADDRESS_CHANGED → CORRECTED) for correction context
        tableOffices.value = mergedOffices.map(o => ({
          ...o,
          new: { ...o.new, actions: normalizeApiActions(o.new.actions) }
        }))
      } else {
        tableOffices.value = addresses
      }
    }

    // Share structure
    if (classes) {
      const originalClasses = formatShareClassesUi(classes)

      if (draft?.shareStructure?.shareClasses?.length) {
        // Draft share classes may use singular `action` (e.g. "EDITED") from the API —
        // normalize to plural `actions` array before formatting.
        const normalizedClasses = draft.shareStructure.shareClasses.map((sc: Record<string, unknown>) => {
          const rawActions: string[] = (sc.actions as string[]) ?? (sc.action ? [sc.action as string] : [])
          const actions = normalizeApiActions(rawActions)
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

    // Receivers — fetch from business, merge with draft if applicable
    if (receivers) {
      if (draft?.parties?.length) {
        const draftReceivers = draft.parties.filter(
          dp => dp.roles?.some(r => r.roleType === RoleType.RECEIVER)
        )
        if (draftReceivers.length) {
          const draftReceiversFormatted: TableBusinessState<PartySchema>[] = draftReceivers.map((dp) => {
            const formatted = formatPartyUi(dp, RoleType.RECEIVER)
            formatted.actions = normalizeApiActions(dp.actions ?? [])
            return { new: formatted, old: undefined }
          })
          const merged = [...receivers]
          for (const draftEntry of draftReceiversFormatted) {
            const draftEntryId = draftEntry.new.id
            const existingIdx = draftEntryId
              ? merged.findIndex(p => p.new.id === draftEntryId)
              : -1
            if (existingIdx >= 0) {
              merged[existingIdx] = {
                new: draftEntry.new,
                old: { ...merged[existingIdx]!.new }
              }
            } else {
              merged.push(draftEntry)
            }
          }
          tableReceivers.value = merged
        } else {
          tableReceivers.value = receivers
        }
      } else {
        tableReceivers.value = receivers
      }
    }

    // Liquidators — fetch from business, merge with draft if applicable
    if (liquidators) {
      if (draft?.parties?.length) {
        const draftLiquidators = draft.parties.filter(
          dp => dp.roles?.some(r => r.roleType === RoleType.LIQUIDATOR)
        )
        if (draftLiquidators.length) {
          const draftLiquidatorsFormatted: TableBusinessState<PartySchema>[] = draftLiquidators.map((dp) => {
            const formatted = formatPartyUi(dp, RoleType.LIQUIDATOR)
            formatted.actions = normalizeApiActions(dp.actions ?? [])
            return { new: formatted, old: undefined }
          })
          const merged = [...liquidators]
          for (const draftEntry of draftLiquidatorsFormatted) {
            const draftEntryId = draftEntry.new.id
            const existingIdx = draftEntryId
              ? merged.findIndex(p => p.new.id === draftEntryId)
              : -1
            if (existingIdx >= 0) {
              merged[existingIdx] = {
                new: draftEntry.new,
                old: { ...merged[existingIdx]!.new }
              }
            } else {
              merged.push(draftEntry)
            }
          }
          tableLiquidators.value = merged
        } else {
          tableLiquidators.value = liquidators
        }
      } else {
        tableLiquidators.value = liquidators
      }
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
      comment: formState.comment ?? '',
      correctedFilingId: correctedFilingId.value!,
      correctedFilingType: correctedFilingType.value,
      correctedFilingDate: correctedFilingDate.value || undefined,
      type: correctionType.value,
      legalType: businessStore.business?.legalType as CorpTypeCd,

      // Parties — correction API expects OrgPerson format (with `officer`, not `entity`)
      // All party types (directors, receivers, liquidators) are combined in one array
      parties: [
        ...tableParties.value,
        ...tableReceivers.value,
        ...tableLiquidators.value
      ].map((entry) => {
        const p = entry.new
        const mailingAddress = formatAddressApi(p.address.mailingAddress as ConnectAddress)
        const deliveryAddress = formatAddressApi(p.address.deliveryAddress as ConnectAddress)
        return {
          officer: {
            id: p.id ? Number(p.id) : undefined,
            partyType: p.name.partyType || PartyType.PERSON,
            firstName: p.name.firstName ?? '',
            middleInitial: p.name.middleName ?? '',
            lastName: p.name.lastName ?? '',
            organizationName: p.name.businessName ?? ''
          },
          mailingAddress,
          deliveryAddress,
          roles: formatRelationshipRolesApi(p.roles, p.actions.includes(ActionType.REMOVED)),
          actions: p.actions
        } as OrgPerson
      }),

      // Offices
      offices: {
        registeredOffice: formatOfficeApi(regOffice),
        recordsOffice: formatOfficeApi(recOffice)
      } as unknown as ApiEntityOfficeAddress,

      // Share structure
      shareStructure: {
        shareClasses: tableShareClasses.value
          .filter(c => isSubmission ? !c.new.actions.includes(ActionType.REMOVED) : true)
          .map(c => ({
            ...c.new,
            name: c.new.name + ' Shares',
            currency: c.new.currency ?? null as unknown as string,
            series: c.new.series
              .filter(s => isSubmission ? !s.actions.includes(ActionType.REMOVED) : true)
              .map(s => ({
                ...s,
                name: s.name + ' Shares'
              }))
          }))
      },

      // Court order (common filing data)
      ...getCommonFilingPayloadData(formState.courtOrder),

      // Document delivery / contact point
      ...(formState.documentDelivery?.completingPartyEmail && {
        contactPoint: { email: formState.documentDelivery.completingPartyEmail }
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
        ...(formState.certify?.legalName ? { certifiedBy: formState.certify.legalName } : {}),
        ...(formState.folio?.folioNumber ? { folioNumber: formState.folio.folioNumber } : {})
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
    const defaults = getCorrectionSchema(isStaff.value).parse({})
    Object.assign(formState, defaults)
    formState.activeDirector = undefined
    formState.activeReceiver = undefined
    formState.activeLiquidator = undefined
    formState.activeOffice = undefined
    formState.activeClass = undefined
    formState.activeSeries = undefined

    correctedFilingId.value = undefined
    correctedFilingType.value = FilingType.UNKNOWN
    correctedFilingDate.value = ''
    correctionType.value = CorrectionType.CLIENT
    correctedFiling.value = undefined

    initialFormState.value = cloneDeep(formState)
    initialDirectors.value = []
    initialReceivers.value = []
    initialLiquidators.value = []
    initialOffices.value = []
    initialShareClasses.value = []
  }

  return {
    formState,
    initializing,
    correctedFiling,
    correctedFilingId,
    correctedFilingType,
    correctedFilingDate,
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
    isStaff,
    init,
    submit,
    $reset
  }
})
