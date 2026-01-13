// TODO - FUTURE - maybe consolidate 'delay' store with other dissolution filings if possible
export const useDodStore = defineStore('delay-of-dissolution-store', () => {
  const { currentAccount } = storeToRefs(useConnectAccountStore())
  const schema = getDodSchema()
  const { initFiling } = useFiling()

  const formState = reactive(schema.parse({}))
  const initializing = ref<boolean>(false)
  // 'unknown' should be updated with the correct
  // dissolution payload type once the api definition is complete
  const draftFilingState = shallowRef<FilingGetByIdResponse<unknown>>({} as FilingGetByIdResponse<unknown>)

  const isStaff = computed(() => currentAccount.value.accountType === AccountType.STAFF)

  async function init(businessId: string, filingSubType?: DissolutionType, draftId?: string) {
    // FUTURE: if consolidating with other dissolution types update below condition
    if (!filingSubType || filingSubType !== DissolutionType.DELAY) {
      await useFilingModals().openInitFilingErrorModal({ status: 500 })
      return
    }
    initializing.value = true
    // reset any previous state (ex: user switches accounts) and init loading state
    $reset()
    // TODO: update type
    // @ts-expect-error - 'unknown' should be updated with the correct
    // dissolution payload type once the api definition is complete
    const { draftFiling } = await initFiling<unknown>(
      businessId,
      FilingType.DISSOLUTION,
      filingSubType,
      draftId
    )

    if (draftFiling?.data.value?.filing) {
      draftFilingState.value = draftFiling.data.value
      // TODO: map draft state
      // delay date
      // court order - staff only
      // folio number
      // add to ledger - staff only
      // certify - non-staff only
    }
    initializing.value = false
  }

  async function submit(isSubmission: boolean) {
    // TODO: build filing payload
    // submit draft or final submission
    // update url with draft filing id response
    // eg: const urlParams = useUrlSearchParams() urlParams.draft = String(filingResp.filing.header.filingId)
    // submit POST request to business api
    return isSubmission
  }

  function $reset() {
    const emptyObj = schema.parse({})
    Object.assign(formState, emptyObj)
  }

  return {
    formState,
    isStaff,
    init,
    submit,
    $reset
  }
})
