import { cloneDeep } from 'es-toolkit'

export const useReviewImportedDataStore = defineStore('review-imported-data-store', () => {
  const { tableState: tableOffices, hasChanges: hasOfficeChanges } = useManageOffices()
  const { tableState: tableDirectors, hasChanges: hasDirectorChanges } = useManageParties()
  const { getPartiesMergedWithRelationships } = useBusinessParty()
  const { formatFilingPayloadApi, hydratePaymentState, initFiling, saveOrSubmitFiling } = useFiling()

  const service = useBusinessService()
  const businessStore = useBusinessStore()
  const modal = useFilingModals()

  const isStaff = useIsStaff()

  const { formState, initialFormState, initializing, snapshotInitialState, resetFormState } = useFilingFormState(
    () => getReviewImportedDataSchema(isStaff.value).parse({}) as ReviewImportedDataFormSchema
  )
  const initialOffices = shallowRef<TableBusinessState<OfficesSchema>[]>([])
  const initialDirectors = shallowRef<TableBusinessState<PartySchema>[]>([])
  const draftFilingState = shallowRef<ReviewImportedDataDraftState>({} as ReviewImportedDataDraftState)

  /** The missing office / director address fields the Legal API flagged on the business. */
  const missingInfo = computed(() => getMissingInfoSummary(businessStore.business?.warnings))

  /** The filing is submittable once at least one office or director address changed (schema anyOf). */
  const hasChanges = computed(() => hasOfficeChanges.value || hasDirectorChanges.value)

  async function init(businessId: string, draftId?: string) {
    initializing.value = true
    // reset any previous state (ex: user switches accounts) and init loading state
    $reset()

    // offices are fetched raw rather than through initFiling so a draft can be merged over the originals
    const [{ draftFiling, parties }, addressResult] = await Promise.all([
      initFiling<ReviewImportedDataFiling>(
        businessId,
        FilingType.REVIEW_IMPORTED_DATA,
        undefined,
        draftId,
        { roleType: RoleType.DIRECTOR }
      ),
      service.getAddresses(businessId).then(data => ({ data })).catch((error: unknown) => ({ error }))
    ])

    // a failed office fetch must not seed both offices as missing - the user would file over real addresses
    if (!('data' in addressResult)) {
      initializing.value = false
      await modal.openInitFilingErrorModal(addressResult.error)
      return
    }

    const draft = draftFiling?.filing?.reviewImportedData
    if (draft) {
      draftFilingState.value = draftFiling
      hydratePaymentState(draftFiling.filing.header, formState)
    }

    const directors = parties ?? []
    tableDirectors.value = draft?.relationships?.length
      ? getPartiesMergedWithRelationships(directors, draft.relationships)
      : directors

    const officeTypes = [OfficeType.REGISTERED, OfficeType.RECORDS]
    tableOffices.value = seedMissingOffices(
      formatOfficesSection(addressResult.data, draft?.offices, officeTypes),
      officeTypes
    )

    await snapshotInitialState()
    initialOffices.value = cloneDeep(tableOffices.value)
    initialDirectors.value = cloneDeep(tableDirectors.value)
  }

  async function submit(isSubmission: boolean) {
    // only the sections the user changed are sent - the api leaves the rest untouched
    // NB: formatOfficesApi sends every office once any changed; an untouched office may still be the
    // broken (or seeded empty) one the api would reject, so filter to the changed rows here
    const offices = formatOfficesApi(tableOffices.value.filter(office => office.new.actions.length > 0))
    const relationships = tableDirectors.value
      .filter(director => director.new.actions.length > 0)
      .map(director => formatRelationshipApi(director.new))

    const reviewImportedDataPayload: ReviewImportedDataPayload = {
      ...(offices ? { offices } : {}),
      ...(relationships.length ? { relationships } : {})
    }

    const filingPayload = formatFilingPayloadApi<ReviewImportedDataFiling>(
      businessStore.business!,
      FilingType.REVIEW_IMPORTED_DATA,
      { reviewImportedData: reviewImportedDataPayload },
      formatPaymentHeaderApi(formState, isStaff.value)
    )

    const filingResp = await saveOrSubmitFiling<ReviewImportedDataFiling>(
      businessStore.businessIdentifier!,
      filingPayload,
      { isSubmission, draftId: draftFilingState.value?.filing?.header?.filingId }
    )
    if (filingResp) {
      draftFilingState.value = filingResp as ReviewImportedDataDraftState
    }
  }

  function $reset() {
    // clear the open sub forms before the reset snapshots the form state
    formState.activeOffice = undefined
    formState.activeDirector = undefined
    resetFormState()
    initialOffices.value = []
    initialDirectors.value = []
    draftFilingState.value = {} as ReviewImportedDataDraftState
    tableOffices.value = []
    tableDirectors.value = []
  }

  return {
    directors: tableDirectors,
    draftFilingState,
    formState,
    hasChanges,
    hasDirectorChanges,
    hasOfficeChanges,
    initialDirectors,
    initialFormState,
    initialOffices,
    initializing,
    isStaff,
    missingInfo,
    offices: tableOffices,
    init,
    submit,
    $reset
  }
})
