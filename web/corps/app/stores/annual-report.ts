export const useAnnualReportStore = defineStore('annual-report-store', () => {
  const { tableState: tableDirectors } = useManageParties()
  const { tableState: tableOffices } = useManageOffices()
  const {
    formatFilingPayloadApi,
    hydratePaymentState,
    initFiling,
    saveOrSubmitFiling
  } = useFiling()

  const businessStore = useBusinessStore()

  const isStaff = useIsStaff()

  const { formState, initialFormState, initializing, snapshotInitialState, resetFormState } = useFilingFormState(
    () => getAnnualReportSchema(isStaff.value).parse({}) as AnnualReportFormSchema
  )
  const draftFilingState = shallowRef<AnnualReportDraftState>({} as AnnualReportDraftState)
  const arYear = ref<number | undefined>(undefined)

  // nextAnnualReport is the annual report due date at Pacific midnight (as an API datetime)
  const nextAnnualReport = computed<ApiDateTimeUtc>(
    () => (businessStore.business as BusinessData | undefined)?.nextAnnualReport ?? ''
  )
  // annualReportDate and nextARDate are both the date part of nextAnnualReport - there is nothing to enter
  const asOfDate = computed<IsoDatePacific>(() => nextAnnualReport.value.split('T')[0] ?? '')

  /**
   * Annual report year precedence: draft header > the year of the business' next AR.
   */
  function resolveArYear(draftYear?: number): number | undefined {
    const businessYear = Number(asOfDate.value.slice(0, 4))
    return draftYear || businessYear || undefined
  }

  async function init(businessId: string, draftId?: string) {
    initializing.value = true
    $reset()

    // directors and offices are fetched for the readonly display sections
    const { draftFiling, parties, addresses } = await initFiling<ARFiling>(
      businessId,
      FilingType.ANNUAL_REPORT,
      undefined,
      draftId,
      { roleType: RoleType.DIRECTOR },
      [OfficeType.REGISTERED, OfficeType.RECORDS]
    )

    const draftHeader = draftFiling?.filing?.header as AnnualReportDraftState['filing']['header'] | undefined

    if (draftFiling?.filing?.annualReport) {
      draftFilingState.value = draftFiling
      hydratePaymentState(draftFiling.filing.header, formState)
    }

    if (parties) {
      tableDirectors.value = parties
    }

    if (addresses) {
      tableOffices.value = addresses
    }

    arYear.value = resolveArYear(draftHeader?.ARFilingYear)

    await snapshotInitialState()
  }

  async function submit(isSubmission: boolean) {
    const annualReportPayload: AnnualReportPayload = {
      annualReportDate: asOfDate.value,
      nextARDate: asOfDate.value
    }

    const headerPayload = {
      ARFilingYear: arYear.value,
      // the AR is effective as of its due date, which may precede payment completion
      // NB: header.effectiveDate must be an API datetime (nextAnnualReport is asOfDate at Pacific midnight)
      effectiveDate: nextAnnualReport.value,
      authorizationReceived: Boolean(formState.authorization?.isAuthorized),
      ...formatPaymentHeaderApi(formState, isStaff.value)
    }

    const filingPayload = formatFilingPayloadApi<ARFiling>(
      businessStore.business!,
      FilingType.ANNUAL_REPORT,
      { annualReport: annualReportPayload },
      headerPayload
    )

    applyAuthorizationCertify(filingPayload.filing.header as Record<string, unknown>, isSubmission)

    // FUTURE: submissions are disabled until the filing form is completed
    if (isSubmission) {
      logBlockedSubmission(filingPayload)
      return
    }

    const filingResp = await saveOrSubmitFiling<ARFiling>(businessStore.businessIdentifier!, filingPayload, {
      isSubmission,
      draftId: draftFilingState.value?.filing?.header?.filingId
    })
    if (filingResp) {
      draftFilingState.value = filingResp as AnnualReportDraftState
    }
  }

  function $reset() {
    resetFormState()
    draftFilingState.value = {} as AnnualReportDraftState
    arYear.value = undefined
    tableDirectors.value = []
    tableOffices.value = []
  }

  return {
    arYear,
    asOfDate,
    directors: tableDirectors,
    formState,
    initialFormState,
    initializing,
    isStaff,
    offices: tableOffices,
    init,
    submit,
    $reset
  }
})
