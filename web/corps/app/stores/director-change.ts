import { cloneDeep } from 'es-toolkit'

export const useDirectorChangeStore = defineStore('director-change-store', () => {
  const { tableState } = useManageParties()
  const {
    applyAuthorizationCertify,
    createFilingPayload,
    getPaymentHeaderApi,
    hydratePaymentState,
    initFiling,
    saveOrSubmitFiling
  } = useFiling()

  const businessStore = useBusinessStore()

  const isStaff = useIsStaff()

  const { formState, initialFormState, initializing, snapshotInitialState, resetFormState } = useFilingFormState(
    () => getDirectorChangeSchema(isStaff.value).parse({}) as DirectorChangeFormSchema
  )
  const initialDirectors = shallowRef<TableBusinessState<PartySchema>[]>([])
  const draftFilingState = shallowRef<CODDraftState>({} as CODDraftState)

  // FUTURE: the user picks this date (min = last director change / founding, max = today) and it
  // re-stamps the appointment/cessation dates of the changed rows
  const effectiveDate = ref<IsoDatePacific>(getToday('America/Vancouver'))

  async function init(businessId: string, draftId?: string) {
    initializing.value = true
    // reset any previous state (ex: user switches accounts) and init loading state
    $reset()

    const { draftFiling, parties } = await initFiling<CODFiling>(
      businessId,
      FilingType.CHANGE_OF_DIRECTORS,
      undefined,
      draftId,
      { roleType: RoleType.DIRECTOR }
    )

    // FUTURE: merge the draft relationships into the parties and restore header.effectiveDate
    if (draftFiling?.filing?.changeOfDirectors) {
      draftFilingState.value = draftFiling
      hydratePaymentState(draftFiling.filing.header, formState)
    }

    if (parties) {
      tableState.value = parties
    }

    await snapshotInitialState()
    initialDirectors.value = cloneDeep(tableState.value)
  }

  async function submit(isSubmission: boolean) {
    const codPayload: CODPayload = {
      // FUTURE: only the rows with actions are sent - the filer processes every item as an edit
      relationships: []
    }

    const headerPayload = {
      // NB: the validator requires an effective date and legal-api enforces the date-time format
      effectiveDate: toApiDateTime(effectiveDate.value),
      authorizationReceived: Boolean(formState.authorization?.isAuthorized),
      ...getPaymentHeaderApi(formState, isStaff.value)
    }

    const filingPayload = createFilingPayload<CODFiling>(
      businessStore.business!,
      FilingType.CHANGE_OF_DIRECTORS,
      { changeOfDirectors: codPayload },
      headerPayload
    )

    applyAuthorizationCertify(filingPayload.filing.header as Record<string, unknown>, isSubmission)

    const filingResp = await saveOrSubmitFiling<CODFiling>(businessStore.businessIdentifier!, filingPayload, {
      isSubmission,
      draftId: draftFilingState.value?.filing?.header?.filingId
    })
    if (filingResp) {
      draftFilingState.value = filingResp as CODDraftState
    }
  }

  function $reset() {
    formState.activeParty = undefined
    resetFormState()
    initialDirectors.value = []
    draftFilingState.value = {} as CODDraftState
    effectiveDate.value = getToday('America/Vancouver')
    tableState.value = []
  }

  return {
    directors: tableState,
    draftFilingState,
    effectiveDate,
    formState,
    initialDirectors,
    initialFormState,
    initializing,
    isStaff,
    init,
    submit,
    $reset
  }
})
