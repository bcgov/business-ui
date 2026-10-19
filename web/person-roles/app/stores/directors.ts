import { cloneDeep } from 'es-toolkit'

const PACIFIC_TZ = 'America/Vancouver'

export const useDirectorsStore = defineStore('directors-store', () => {
  const ld = useConnectLaunchDarkly()
  const modal = useFilingModals()
  const businessStore = useBusinessStore()
  const feeStore = useConnectFeeStore()
  const { tableState } = useManageParties()
  const {
    formatFilingPayloadApi,
    hydratePaymentState,
    initFiling,
    saveOrSubmitFiling
  } = useFiling()

  const isStaff = useIsStaff()

  // corps configuration until init resolves the business legal type
  const config = ref<DirectorsConfig>(getDirectorsConfig())

  const { formState, initialFormState, initializing, snapshotInitialState, resetFormState } = useFilingFormState(
    () => getDirectorsSchema(isStaff.value, config.value.certify).parse({}) as DirectorsFormSchema
  )
  const initialDirectors = shallowRef<TableBusinessState<PartySchema>[]>([])
  const draftFilingState = shallowRef<CODDraftState>({} as CODDraftState)

  /**
   * The date the director changes take effect — required.
   * Lower bound per config.minDateSource: corps lastDirectorChangeDate (or founding when
   * `enable-backdated-cod` allows), coops latest(lastDirectorChangeDate, lastAnnualReportDate).
   * Upper bound is today.
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

    if (!businessStore.business) {
      // rely on common error handling
      initializing.value = false
      return
    }

    const allowedBusinessTypes = (
      await ld.getFeatureFlag('supported-change-of-directors-entities', '', 'await')
    ).split(' ') as CorpTypeCd[]
    if (!allowedBusinessTypes.includes(businessStore.business.legalType)) {
      initializing.value = false
      await modal.openFilingNotAvailableModal()
      return
    }

    // the legal type decides the fee codes and certify convention
    config.value = getDirectorsConfig(businessStore.business.legalType)
    if (config.value.certify !== 'authorization') {
      delete formState.authorization
    }
    resetFormState()
    await syncConfiguredFee()

    if (draftFiling?.filing?.changeOfDirectors) {
      draftFilingState.value = draftFiling as CODDraftState
      hydratePaymentState(draftFiling.filing.header, formState)
      // restore the effective date from the draft header
      if (draftFiling.filing.header?.effectiveDate) {
        effectiveDate.value = (draftFiling.filing.header.effectiveDate.split('T')[0]
          ?? getToday(PACIFIC_TZ)) as IsoDatePacific
      }
    }

    tableState.value = parties ?? []

    await snapshotInitialState()
    initialDirectors.value = cloneDeep(tableState.value)
  }

  /**
   * initFiling resolves the fee from the i18n feeCode (the corps code) - swap in the
   * configured code when it differs (coops flow).
   */
  async function syncConfiguredFee() {
    const t = useNuxtApp().$i18n.t
    const { paidFeeCode } = config.value
    const defaultCode = t('page.changeOfDirectors.feeCode')
    if (paidFeeCode === defaultCode) {
      return
    }

    const label = t('page.changeOfDirectors.feeLabel')
    if (!feeStore.feesCached[paidFeeCode]) {
      await feeStore.initFees(
        [{ code: paidFeeCode, entityType: businessStore.business!.legalType, label }],
        { label }
      )
    }
    // the pay api lookup can fail, leaving the code uncached - keep the existing line
    if (feeStore.feesCached[paidFeeCode]) {
      feeStore.removeFee(defaultCode)
      feeStore.addReplaceFee(paidFeeCode)
    }
  }

  async function submit(isSubmission: boolean) {
    const codPayload: CODPayload = {
      relationships: formatChangeOfDirectorsRelationshipsApi(tableState.value, {
        removedCessationDate: effectiveDate.value
      })
    }

    const headerPayload = {
      // NB: the validator requires an effective date and legal-api enforces the date-time format
      effectiveDate: toApiDateTime(effectiveDate.value),
      ...(config.value.certify === 'authorization'
        ? { authorizationReceived: Boolean(formState.authorization?.isAuthorized) }
        : {}),
      ...formatPaymentHeaderApi(formState, isStaff.value)
    }

    const filingPayload = formatFilingPayloadApi<CODFiling>(
      businessStore.business!,
      FilingType.CHANGE_OF_DIRECTORS,
      { changeOfDirectors: codPayload },
      headerPayload
    )

    if (config.value.certify === 'authorization') {
      applyAuthorizationCertify(filingPayload.filing.header as Record<string, unknown>, isSubmission)
    }

    const filingResp = await saveOrSubmitFiling<CODFiling>(businessStore.businessIdentifier!, filingPayload, {
      isSubmission,
      draftId: draftFilingState.value?.filing?.header?.filingId
    })
    if (filingResp) {
      draftFilingState.value = filingResp as CODDraftState
    }
  }

  function $reset() {
    // cleared before the reset snapshot - the sub form key is absent from the schema defaults
    formState.activeParty = undefined
    config.value = getDirectorsConfig()
    resetFormState()
    draftFilingState.value = {} as CODDraftState
    tableState.value = []
    initialDirectors.value = []
    effectiveDate.value = getToday(PACIFIC_TZ)
  }

  return {
    config,
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
