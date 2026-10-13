import { cloneDeep } from 'es-toolkit'

const PACIFIC_TZ = 'America/Vancouver'

export const useDirectorChangeStore = defineStore('director-change-store', () => {
  const {
    createFilingPayload,
    getPaymentHeaderApi,
    hydratePaymentState,
    initFiling,
    saveOrSubmitFiling
  } = useFiling()

  const businessStore = useBusinessStore()
  const { tableState } = useManageParties()

  const isStaff = useIsStaff()

  const initialDirectors = shallowRef<TableBusinessState<PartySchema>[]>([])
  const draftFilingState = shallowRef<CODDraftState>({} as CODDraftState)

  const {
    formState,
    initialFormState,
    initializing,
    snapshotInitialState,
    resetFormState
  } = useFilingFormState<CoopDirectorChangeSchema>(() => getCoopDirectorChangeSchema(isStaff.value).parse({}))

  /**
   * The date the director changes take effect - required.
   * NB: The corps `enable-backdated-cod` flag does not apply to coops.
   * FUTURE: make this user selectable. The coop lower bound is
   * latest(lastDirectorChangeDate, lastAnnualReportDate) || founding date, upper bound today.
   */
  const effectiveDate = ref<IsoDatePacific>(getToday(PACIFIC_TZ))

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

    // FUTURE: merge the draft relationships over the fetched directors
    // (getPartiesMergedWithRelationships) and gate the filing to CP businesses
    tableState.value = parties ?? []

    if (draftFiling?.filing?.changeOfDirectors) {
      draftFilingState.value = draftFiling as CODDraftState
      // re-syncs the fee widget with a resumed staff payment selection
      hydratePaymentState(draftFilingState.value.filing.header, formState)
    }

    await snapshotInitialState()
    initialDirectors.value = cloneDeep(tableState.value)
  }

  async function submit(isSubmission: boolean) {
    // NB: only send changed rows
    const codPayload: CODPayload = {
      relationships: []
    }

    const apiEffectiveDate = toApiDateTime(effectiveDate.value)

    const filingPayload = createFilingPayload<CODFiling>(
      businessStore.business!,
      FilingType.CHANGE_OF_DIRECTORS,
      { changeOfDirectors: codPayload },
      {
        // required
        ...(apiEffectiveDate ? { effectiveDate: apiEffectiveDate } : {}),
        // FUTURE: the certify section (base FormCertify) supplies the name - until
        // then createFilingPayload defaults it to the signed in user's name
        ...getPaymentHeaderApi(formState, isStaff.value)
      } as Partial<FilingHeaderSubmission>
    )

    const filingResp = await saveOrSubmitFiling<CODFiling>(
      businessStore.businessIdentifier!,
      filingPayload,
      { isSubmission, draftId: draftFilingState.value?.filing?.header?.filingId }
    )
    if (filingResp) {
      draftFilingState.value = filingResp as CODDraftState
    }
  }

  function $reset() {
    // cleared before the reset snapshot - the sub form key is absent from the schema defaults
    formState.activeParty = undefined
    resetFormState()
    draftFilingState.value = {} as CODDraftState
    tableState.value = []
    initialDirectors.value = []
    effectiveDate.value = getToday(PACIFIC_TZ)
  }

  return {
    directors: tableState,
    effectiveDate,
    formState,
    initializing,
    initialDirectors,
    initialFormState,
    isStaff,
    init,
    submit,
    $reset
  }
})
