import { cloneDeep } from 'es-toolkit'

export const useAddressChangeStore = defineStore('address-change-store', () => {
  const {
    formatFilingPayloadApi,
    hydratePaymentState,
    initFiling,
    saveOrSubmitFiling
  } = useFiling()

  const businessStore = useBusinessStore()
  const { tableState } = useManageOffices()

  const isStaff = useIsStaff()

  const initialOffices = shallowRef<TableBusinessState<OfficesSchema>[]>([])
  const draftFilingState = shallowRef<COADraftState>({} as COADraftState)

  const {
    formState,
    initialFormState,
    initializing,
    snapshotInitialState,
    resetFormState
  } = useFilingFormState<CoopAddressChangeSchema>(() => getCoopAddressChangeSchema(isStaff.value).parse({}))

  async function init(businessId: string, draftId?: string) {
    initializing.value = true
    // reset any previous state (ex: user switches accounts) and init loading state
    $reset()

    // NB: registered office only - a coop has no records office and the CP schema branch
    // only requires (and the filer only processes) the registered office
    const { draftFiling, addresses } = await initFiling<COAFiling>(
      businessId,
      FilingType.CHANGE_OF_ADDRESS,
      undefined,
      draftId,
      undefined,
      [OfficeType.REGISTERED]
    )

    tableState.value = addresses ?? []

    // FUTURE: merge the draft offices over the fetched registered office with formatDraftTableState
    // and gate the filing to CP businesses
    if (draftFiling?.filing?.changeOfAddress) {
      draftFilingState.value = draftFiling as COADraftState
      // re-syncs the fee widget with a resumed staff payment selection
      hydratePaymentState(draftFilingState.value.filing.header, formState)
    }

    await snapshotInitialState()
    initialOffices.value = cloneDeep(tableState.value)
  }

  async function submit(isSubmission: boolean) {
    const coaPayload: COAPayload = {
      // schema required - the body echoes the legal type of the business
      legalType: businessStore.business!.legalType,
      // the registered office is the only row in the table state, changed or not
      offices: formatChangeOfAddressOfficesApi(tableState.value)
    }

    const filingPayload = formatFilingPayloadApi<COAFiling>(
      businessStore.business!,
      FilingType.CHANGE_OF_ADDRESS,
      { changeOfAddress: coaPayload },
      {
        // NB: no effectiveDate - handled by api (effective immediately)
        // FUTURE: the certify section (base FormCertify) supplies the name - until
        // then formatFilingPayloadApi defaults it to the signed in user's name
        ...formatPaymentHeaderApi(formState, isStaff.value)
      } as Partial<FilingHeaderSubmission>
    )

    // FUTURE: submissions are disabled until the filing form is completed
    if (isSubmission) {
      logBlockedSubmission(filingPayload)
      return
    }

    const filingResp = await saveOrSubmitFiling<COAFiling>(
      businessStore.businessIdentifier!,
      filingPayload,
      { isSubmission, draftId: draftFilingState.value?.filing?.header?.filingId }
    )
    if (filingResp) {
      draftFilingState.value = filingResp as COADraftState
    }
  }

  function $reset() {
    // cleared before the reset snapshot - the sub form key is absent from the schema defaults
    formState.activeOffice = undefined
    resetFormState()
    draftFilingState.value = {} as COADraftState
    tableState.value = []
    initialOffices.value = []
  }

  return {
    draftFilingState,
    formState,
    initializing,
    initialFormState,
    initialOffices,
    isStaff,
    offices: tableState,
    init,
    submit,
    $reset
  }
})
