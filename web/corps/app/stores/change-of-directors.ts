import { cloneDeep } from 'es-toolkit'

export const useChangeOfDirectorsStore = defineStore('change-of-directors-store', () => {
  const { tableState } = useManageParties()
  const {
    formatFilingPayloadApi,
    hydratePaymentState,
    initFiling,
    saveOrSubmitFiling
  } = useFiling()

  const businessStore = useBusinessStore()

  const isStaff = useIsStaff()

  const { formState, initialFormState, initializing, snapshotInitialState, resetFormState } = useFilingFormState(
    () => getChangeOfDirectorsSchema(isStaff.value).parse({}) as ChangeOfDirectorsFormSchema
  )
  const draftFilingState = shallowRef<CODDraftState>({} as CODDraftState)
  const initialDirectors = shallowRef<TableBusinessState<PartySchema>[]>([])

  async function init(businessId: string, draftId?: string) {
    initializing.value = true
    $reset()

    const { draftFiling, parties } = await initFiling<CODFiling>(
      businessId,
      FilingType.CHANGE_OF_DIRECTORS,
      undefined,
      draftId,
      { roleType: RoleType.DIRECTOR }
    )

    if (draftFiling?.filing?.changeOfDirectors) {
      draftFilingState.value = draftFiling
      hydratePaymentState(draftFiling.filing.header, formState)
      // hydrate the COD date from the draft
      if (draftFiling.filing.header?.effectiveDate) {
        formState.codDate = draftFiling.filing.header.effectiveDate.split('T')[0] ?? ''
      }
    }

    if (parties) {
      tableState.value = parties
    }

    await snapshotInitialState()
    initialDirectors.value = cloneDeep(tableState.value)
  }

  async function submit(isSubmission: boolean) {
    const codPayload: CODPayload = {
      relationships: formatChangeOfDirectorsRelationshipsApi(tableState.value, {
        removedCessationDate: formState.codDate
      })
    }

    const headerPayload = {
      effectiveDate: formState.codDate ? toApiDateTime(formState.codDate) : undefined,
      authorizationReceived: Boolean(formState.authorization?.isAuthorized),
      ...formatPaymentHeaderApi(formState, isStaff.value)
    }

    const filingPayload = formatFilingPayloadApi<CODFiling>(
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
    resetFormState()
    draftFilingState.value = {} as CODDraftState
    initialDirectors.value = []
    tableState.value = []
  }

  return {
    directors: tableState,
    draftFilingState,
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
