export const useAnnualReportStore = defineStore('annual-report-store', () => {
  const { tableState: tableDirectors } = useManageParties()
  const { tableState: tableOffices } = useManageOffices()
  const {
    formatFilingPayloadApi,
    initFiling,
    saveOrSubmitFiling
  } = useFiling()

  const businessStore = useBusinessStore()

  const isStaff = useIsStaff()

  const { formState, initialFormState, initializing, snapshotInitialState, resetFormState } = useFilingFormState(
    () => getAnnualReportSchema(isStaff.value).parse({}) as AnnualReportFormSchema
  )
  const arYear = ref<number | undefined>(undefined)

  // nextAnnualReport is the annual report due date at Pacific midnight (as an API datetime)
  const nextAnnualReport = computed<ApiDateTimeUtc>(
    () => (businessStore.business as BusinessData | undefined)?.nextAnnualReport ?? ''
  )
  // annualReportDate and nextARDate are both the date part of nextAnnualReport - there is nothing to enter
  const asOfDate = computed<IsoDatePacific>(() => nextAnnualReport.value.split('T')[0] ?? '')

  /**
   * A corps annual report is strictly the next one due and is composed from live business data -
   * there are no drafts (legacy parity: the page ships `saveEnabled: false`).
   */
  async function init(businessId: string) {
    initializing.value = true
    $reset()

    // directors and offices are fetched for the readonly display sections
    const { parties, addresses } = await initFiling<ARFiling>(
      businessId,
      FilingType.ANNUAL_REPORT,
      undefined,
      undefined,
      { roleType: RoleType.DIRECTOR },
      [OfficeType.REGISTERED, OfficeType.RECORDS]
    )

    if (parties) {
      tableDirectors.value = parties
    }

    if (addresses) {
      tableOffices.value = addresses
    }

    // undefined when the business has no next annual report due
    arYear.value = Number(asOfDate.value.slice(0, 4)) || undefined

    await snapshotInitialState()
  }

  /** @param isSubmission the useFilingPage contract - a save is a no-op (the page has no save button) */
  async function submit(isSubmission: boolean) {
    if (!isSubmission) {
      return
    }

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

    applyAuthorizationCertify(filingPayload.filing.header as Record<string, unknown>, true)

    // FUTURE: submissions are disabled until the filing form is completed - drop this gate to file
    if (isSubmission) {
      logBlockedSubmission(filingPayload)
      return
    }

    // no draft id - saveOrSubmitFiling posts the filing
    await saveOrSubmitFiling<ARFiling>(businessStore.businessIdentifier!, filingPayload, { isSubmission: true })
  }

  function $reset() {
    resetFormState()
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
