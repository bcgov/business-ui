export const useDodStore = defineStore('delay-of-dissolution-store', () => {
  const { currentAccount } = storeToRefs(useConnectAccountStore())
  const schema = getDodSchema()
  const { initFiling } = useFiling()

  const formState = reactive(schema.parse({}))
  const initializing = ref<boolean>(false)
  const draftFilingState = shallowRef<FilingGetByIdResponse<unknown>>({} as FilingGetByIdResponse<unknown>) // TODO: update type
  const delaySubType = ref<'delay' | 'stay'>('delay') // TODO: update type

  const isStaff = computed(() => currentAccount.value.accountType === AccountType.STAFF)

  // TODO: update with correct filing sub type
  async function init(businessId: string, filingSubType?: 'delay' | 'stay', draftId?: string) {
    if (!filingSubType) {
      await useFilingModals().openInitFilingErrorModal({ status: 500 })
      return
    }
    initializing.value = true
    delaySubType.value = filingSubType
    // reset any previous state (ex: user switches accounts) and init loading state
    $reset()
    // TODO: update type
    // @ts-expect-error - 'unknown' should be updated with the correct type once the api definition is complete
    const { draftFiling } = await initFiling<unknown>(
      businessId,
      FilingType.CHANGE_OF_RECEIVERS,
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
