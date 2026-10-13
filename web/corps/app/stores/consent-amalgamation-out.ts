export const useConsentAmalgamationOutStore = defineStore('consent-amalgamation-out-store', () => {
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
    () => getConsentAmalgamationOutSchema(isStaff.value).parse({}) as ConsentAmalgamationOutFormSchema
  )
  const draftFilingState = shallowRef<CAODraftState>({} as CAODraftState)

  async function init(businessId: string, draftId?: string) {
    initializing.value = true
    // reset any previous state (ex: user switches accounts) and init loading state
    $reset()

    const { draftFiling } = await initFiling<CAOFiling>(
      businessId,
      FilingType.CONSENT_AMALGAMATION_OUT,
      undefined,
      draftId
    )

    // FUTURE: hydrate the jurisdiction and the court order
    if (draftFiling?.filing?.consentAmalgamationOut) {
      draftFilingState.value = draftFiling
      const header = draftFilingState.value.filing.header
      if (formState.documentDelivery) {
        formState.documentDelivery.completingPartyEmail = header.documentOptionalEmail ?? ''
      }
      hydratePaymentState(header, formState)
    }

    await snapshotInitialState()
  }

  async function submit(isSubmission: boolean) {
    const caoPayload: CAOPayload = {
      // FUTURE: the user selects the jurisdiction
      foreignJurisdiction: { country: '', region: null }
    }

    const headerPayload = {
      // NB: no effectiveDate - the filer derives the 6 month consent expiry from the real effective date
      authorizationReceived: Boolean(formState.authorization?.isAuthorized),
      ...(formState.documentDelivery?.completingPartyEmail
        ? { documentOptionalEmail: formState.documentDelivery.completingPartyEmail }
        : {}
      ),
      ...getPaymentHeaderApi(formState, isStaff.value)
    }

    const filingPayload = createFilingPayload<CAOFiling>(
      businessStore.business!,
      FilingType.CONSENT_AMALGAMATION_OUT,
      { consentAmalgamationOut: caoPayload },
      headerPayload
    )

    applyAuthorizationCertify(filingPayload.filing.header as Record<string, unknown>, isSubmission)

    const filingResp = await saveOrSubmitFiling<CAOFiling>(businessStore.businessIdentifier!, filingPayload, {
      isSubmission,
      draftId: draftFilingState.value?.filing?.header?.filingId
    })
    if (filingResp) {
      draftFilingState.value = filingResp as CAODraftState
    }
  }

  function $reset() {
    resetFormState()
    draftFilingState.value = {} as CAODraftState
  }

  return {
    draftFilingState,
    formState,
    initialFormState,
    initializing,
    isStaff,
    init,
    submit,
    $reset
  }
})
