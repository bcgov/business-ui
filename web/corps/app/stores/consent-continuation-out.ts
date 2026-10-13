export const useConsentContinuationOutStore = defineStore('consent-continuation-out-store', () => {
  const { createFilingPayload, getPaymentHeaderApi, hydratePaymentState, initFiling, saveOrSubmitFiling } = useFiling()

  const businessStore = useBusinessStore()

  const isStaff = useIsStaff()

  const { formState, initialFormState, initializing, snapshotInitialState, resetFormState } = useFilingFormState(
    () => getConsentContinuationOutSchema(isStaff.value).parse({}) as ConsentContinuationOutFormSchema
  )
  const draftFilingState = shallowRef<CCODraftState>({} as CCODraftState)

  async function init(businessId: string, draftId?: string) {
    initializing.value = true
    // reset any previous state (ex: user switches accounts) and init loading state
    $reset()

    const { draftFiling } = await initFiling<CCOFiling>(
      businessId,
      FilingType.CONSENT_CONTINUATION_OUT,
      undefined,
      draftId
    )

    // FUTURE: hydrate the jurisdiction, the staff detail, the court order and the completing party
    // name (header.certifiedBy)
    if (draftFiling?.filing?.consentContinuationOut) {
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
    const ccoPayload: CCOPayload = {
      // FUTURE: the user selects the jurisdiction - drafts can be saved with an empty country
      // because legal-api only validates the jurisdiction on submission
      foreignJurisdiction: { country: '', region: null }
    }

    const headerPayload = {
      // NB: no effectiveDate - the filer sets the 6 month consent expiry from the real effective date
      // FUTURE: the completing party confirmation drives this
      authorizationReceived: true,
      ...(formState.documentDelivery?.completingPartyEmail
        ? { documentOptionalEmail: formState.documentDelivery.completingPartyEmail }
        : {}
      ),
      ...getPaymentHeaderApi(formState, isStaff.value)
    }

    const filingPayload = createFilingPayload<CCOFiling>(
      businessStore.business!,
      FilingType.CONSENT_CONTINUATION_OUT,
      { consentContinuationOut: ccoPayload },
      headerPayload
    )

    // NB: unlike the other corps filings certifiedBy is kept (createFilingPayload defaults it to the auth user's
    // name) - the completing party name must appear on the letter of consent
    // FUTURE: the completing party confirmation owns the name
    const header = filingPayload.filing.header as Record<string, unknown>
    // authorization is only recorded on submission
    if (!isSubmission) {
      delete header.authorizationReceived
    }

    const filingResp = await saveOrSubmitFiling<CCOFiling>(businessStore.businessIdentifier!, filingPayload, {
      isSubmission,
      draftId: draftFilingState.value?.filing?.header?.filingId
    })
    if (filingResp) {
      draftFilingState.value = filingResp as CCODraftState
    }
  }

  function $reset() {
    resetFormState()
    draftFilingState.value = {} as CCODraftState
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
