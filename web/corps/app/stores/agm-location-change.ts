import { cloneDeep } from 'es-toolkit'

export const useAgmLocationChangeStore = defineStore('agm-location-change-store', () => {
  const { initFiling, createFilingPayload } = useFiling()

  const service = useBusinessService()
  const businessStore = useBusinessStore()
  const modal = useFilingModals()

  const isStaff = useIsStaff()

  const formState = reactive<AgmLocationChangeFormSchema>({} as AgmLocationChangeFormSchema)
  const initialFormState = shallowRef<AgmLocationChangeFormSchema>({} as AgmLocationChangeFormSchema)
  const initializing = ref<boolean>(false)
  const draftFilingState = shallowRef<AgmLocationChangeDraftState>({} as AgmLocationChangeDraftState)

  // initialise defaults immediately so formState is never empty
  Object.assign(formState, getAgmLocationChangeSchema(isStaff.value).parse({}))

  async function init(businessId: string, draftId?: string) {
    initializing.value = true
    $reset()

    const { draftFiling } = await initFiling<AgmLocationChangeFiling>(
      businessId,
      FilingType.AGM_LOCATION_CHANGE,
      undefined,
      draftId
    )

    if (businessStore.business && !businessStore.isBaseCompany()) {
      initializing.value = false
      await modal.openFilingNotAllowedErrorModal()
      return
    }

    if (draftFiling?.filing?.agmLocationChange) {
      draftFilingState.value = draftFiling
      const draft = draftFiling.filing.agmLocationChange
      formState.year = draft.year ?? ''
      formState.reason = draft.reason ?? ''
      formState.agmLocation = draft.agmLocation ?? ''
    }

    await nextTick()
    initialFormState.value = cloneDeep(formState)
    initializing.value = false
  }

  async function submit(isSubmission: boolean) {
    const agmLocationChangePayload: AgmLocationChangePayload = {
      year: formState.year!,
      reason: formState.reason!,
      agmLocation: formState.agmLocation!
    }

    const authorizationReceived = isStaff.value
      ? Boolean(formState.authorization?.isAuthorized)
      : Boolean(formState.certify?.isCertified)

    const filingPayload = createFilingPayload<AgmLocationChangeFiling>(
      businessStore.business!,
      FilingType.AGM_LOCATION_CHANGE,
      { agmLocationChange: agmLocationChangePayload },
      { authorizationReceived } as Record<string, unknown>
    )

    const header = filingPayload.filing.header as Record<string, unknown>
    // remove authorizationReceived from header when saving a draft
    if (!isSubmission) {
      delete header.authorizationReceived
    }

    const draftId = draftFilingState.value?.filing?.header?.filingId
    if (draftId || !isSubmission) {
      const filingResp = await service.saveOrUpdateDraftFiling<AgmLocationChangeFiling>(
        businessStore.businessIdentifier!,
        filingPayload,
        isSubmission,
        draftId as string | number
      )
      draftFilingState.value = filingResp as unknown as AgmLocationChangeDraftState
    } else {
      await service.postFiling(businessStore.businessIdentifier!, filingPayload)
    }
  }

  function $reset() {
    const defaults = getAgmLocationChangeSchema(isStaff.value).parse({})
    Object.assign(formState, defaults)
    initialFormState.value = cloneDeep(formState)
    draftFilingState.value = {} as AgmLocationChangeDraftState
  }

  return {
    formState,
    initializing,
    initialFormState,
    isStaff,
    init,
    submit,
    $reset
  }
})
