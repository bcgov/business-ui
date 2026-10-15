import { cloneDeep } from 'es-toolkit'

export const useAddressChangeStore = defineStore('address-change-store', () => {
  const { tableState } = useManageOffices()
  const {
    formatFilingPayloadApi,
    hydratePaymentState,
    initFiling,
    saveOrSubmitFiling
  } = useFiling()

  const businessStore = useBusinessStore()

  const isStaff = useIsStaff()

  const { formState, initialFormState, initializing, snapshotInitialState, resetFormState } = useFilingFormState(
    () => getAddressChangeSchema(isStaff.value).parse({}) as AddressChangeFormSchema
  )
  const initialOffices = shallowRef<TableBusinessState<OfficesSchema>[]>([])
  const draftFilingState = shallowRef<COADraftState>({} as COADraftState)

  async function init(businessId: string, draftId?: string) {
    initializing.value = true
    // reset any previous state (ex: user switches accounts) and init loading state
    $reset()

    const { draftFiling, addresses } = await initFiling<COAFiling>(
      businessId,
      FilingType.CHANGE_OF_ADDRESS,
      undefined,
      draftId,
      undefined,
      [OfficeType.REGISTERED, OfficeType.RECORDS]
    )

    // FUTURE: merge the draft offices into the table state with formatDraftTableState
    if (draftFiling?.filing?.changeOfAddress) {
      draftFilingState.value = draftFiling
      hydratePaymentState(draftFiling.filing.header, formState)
    }

    if (addresses) {
      tableState.value = addresses
    }

    await snapshotInitialState()
    initialOffices.value = cloneDeep(tableState.value)
  }

  async function submit(isSubmission: boolean) {
    const coaPayload: COAPayload = {
      // schema required - the body echoes the legal type of the business
      legalType: businessStore.business!.legalType,
      // both offices are always sent, changed or not - the corps schema requires both
      offices: formatChangeOfAddressOfficesApi(tableState.value)
    }

    const headerPayload = {
      // NB: no effectiveDate - api forces it to 00:01 PT the next day
      authorizationReceived: Boolean(formState.authorization?.isAuthorized),
      ...formatPaymentHeaderApi(formState, isStaff.value)
    }

    const filingPayload = formatFilingPayloadApi<COAFiling>(
      businessStore.business!,
      FilingType.CHANGE_OF_ADDRESS,
      { changeOfAddress: coaPayload },
      headerPayload
    )

    applyAuthorizationCertify(filingPayload.filing.header as Record<string, unknown>, isSubmission)

    // FUTURE: submissions are disabled until the filing form is completed
    if (isSubmission) {
      logBlockedSubmission(filingPayload)
      return
    }

    const filingResp = await saveOrSubmitFiling<COAFiling>(businessStore.businessIdentifier!, filingPayload, {
      isSubmission,
      draftId: draftFilingState.value?.filing?.header?.filingId
    })
    if (filingResp) {
      draftFilingState.value = filingResp as COADraftState
    }
  }

  function $reset() {
    formState.activeOffice = undefined
    resetFormState()
    initialOffices.value = []
    draftFilingState.value = {} as COADraftState
    tableState.value = []
  }

  return {
    draftFilingState,
    formState,
    initialFormState,
    initialOffices,
    initializing,
    isStaff,
    offices: tableState,
    init,
    submit,
    $reset
  }
})
