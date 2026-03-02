import { cloneDeep } from 'es-toolkit'

export const useOfficerStore = defineStore('officer-store', () => {
  const ld = useConnectLaunchDarkly()
  const businessApi = useBusinessApi()
  const businessStore = useBusinessStore()
  const { tableState } = useManageParties()
  const { getPartiesMergedWithRelationships } = useBusinessParty()
  const { initFiling } = useFiling()
  const modal = useFilingModals()

  const officersSchema = getOfficersSchema()
  const draftFilingState = shallowRef<OfficersDraftState>({} as OfficersDraftState)
  const formState = reactive<OfficersFormSchema>(officersSchema.parse({}))
  const initialFormState = shallowRef<OfficersFormSchema>({} as OfficersFormSchema)
  const initialOfficers = shallowRef<TableBusinessState<PartySchema>[]>([])
  const initializing = ref<boolean>(false) // officer store loading state

  async function init(businessId: string, draftId?: string) {
    try {
      // reset any previous state (ex: user switches accounts) and init loading state
      $reset()
      initializing.value = true

      const { draftFiling, parties } = await initFiling<ChangeOfOfficers>(
        businessId,
        FilingType.CHANGE_OF_OFFICERS,
        undefined,
        draftId,
        { roleClass: RoleClass.OFFICER }
      )

      if (!businessStore.business) {
        // rely on common error handling
        initializing.value = false
        return
      }
      const allowedBusinessTypes = (
        await ld.getFeatureFlag('supported-change-of-officers-entities', '', 'await')
      ).split(' ') as CorpTypeCd[]
      if (!businessStore.business || !allowedBusinessTypes.includes(businessStore.business.legalType)) {
        await modal.openFilingNotAvailableModal()
        return
      }

      const draft = draftFiling?.filing?.changeOfOfficers
      if (draft) {
        draftFilingState.value = draftFiling
        // folio number
        if (draftFilingState.value.filing.header.folioNumber) {
          formState.folio.folioNumber = draftFilingState.value.filing.header.folioNumber
        }
      }

      if (parties) {
        const draftRelationships = draft?.relationships
        tableState.value = draftRelationships
          ? getPartiesMergedWithRelationships(parties, draftRelationships)
          : parties
      }

      await nextTick()
      initialFormState.value = cloneDeep(formState)
      initialOfficers.value = cloneDeep(tableState.value)
    } catch (error) {
      // should never get here unless unhandled type/value error, fetch errors handled by useFiling composable
      await modal.openInitFilingErrorModal(error)
    } finally {
      initializing.value = false
    }
  }

  async function submit(isSubmission: boolean) {
    const officersPayload: OfficersPayload = {
      relationships: (
        tableState.value.map(relationship => formatRelationshipApi(relationship.new))
        // Only add relationships that have changes
      ).filter(relationship => relationship.actions?.length)
    }

    const payload = businessApi.createFilingPayload<ChangeOfOfficers>(
      businessStore.business!,
      FilingType.CHANGE_OF_OFFICERS,
      { changeOfOfficers: officersPayload }
    )

    const draftId = draftFilingState.value?.filing?.header?.filingId
    if (draftId || !isSubmission) {
      const filingResp = await businessApi.saveOrUpdateDraftFiling<ChangeOfOfficers>(
        businessStore.businessIdentifier!,
        payload,
        isSubmission,
        draftId as string | number
      )
      draftFilingState.value = filingResp as unknown as OfficersDraftState
      const urlParams = useUrlSearchParams()
      urlParams.draft = String(filingResp.filing.header.filingId)
    } else {
      await businessApi.postFiling(businessStore.businessIdentifier!, payload)
    }
  }

  /**
  * Resets Officer store to default state
  */
  function $reset() {
    sessionStorage.removeItem('officer-store')
    initializing.value = false
    const defaults = officersSchema.parse({})
    Object.assign(formState, defaults)
    formState.activeParty = undefined
    initialFormState.value = {
      ...defaults,
      activeParty: undefined
    }
    initialOfficers.value = []
  }

  return {
    formState,
    draftFilingState,
    initializing,
    officers: tableState,
    initialFormState,
    initialOfficers,
    init,
    submit,
    $reset
  }
})
