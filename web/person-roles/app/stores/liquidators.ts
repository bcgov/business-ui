import type { ManageLiquidatorsSchema } from '~/utils/schemas/forms/manage-liquidators'

export const useLiquidatorStore = defineStore('liquidator-store', () => {
  const liquidatorSchema = getLiquidatorsSchema()
  const { tableState } = useManageParties()

  const businessApi = useBusinessApi()
  const businessStore = useBusinessStore()

  const initializing = ref<boolean>(false) // liquidator store loading state
  const draftFilingState = shallowRef<ManageLiquidatorsSchema>({} as ManageLiquidatorsSchema) // filing state saved as draft

  const formState = reactive<LiquidatorFormSchema>(liquidatorSchema.parse({}))

  // TODO: watcher on these that updates fee summary OR added as part of compute fns
  const newParties = computed(() => tableState.value.filter(p => p.new?.actions.includes(ActionType.ADDED)))
  const ceasedParties = computed(() => tableState.value.filter(p => p.new?.actions.includes(ActionType.REMOVED)))

  async function init(businessId: string, draftId?: string) {
    initializing.value = true
    // reset any previous state (ex: user switches accounts) and init loading state
    $reset()
    const { draftFiling, parties } = await useFiling().initFiling<ManageLiquidatorsSchema>(
      businessId,
      FilingType.CHANGE_OF_LIQUIDATORS,
      draftId,
      { roleType: RoleType.LIQUIDATOR })

    if (draftFiling?.data.value?.filing) {
      draftFilingState.value = draftFiling.data.value.filing
      formState.courtOrder = draftFilingState.value.courtOrder
      formState.documentId = draftFilingState.value.documentId
      formState.recordsAddress = draftFilingState.value.recordsAddress
      formState.staffPayment = draftFilingState.value.staffPayment
      tableState.value = draftFilingState.value.parties
    } else if (parties?.data) {
      tableState.value = parties.data
    }
    initializing.value = false
  }

  async function save(draftId?: string) {
    const payload = businessApi.createFilingPayload<{ changeOfLiquidators: ManageLiquidatorsSchema }>(
      businessStore.business!,
      FilingType.CHANGE_OF_RECEIVERS,
      { changeOfLiquidators: { ...formState, parties: tableState.value } },
      formState.staffPayment
    )

    await businessApi.saveOrUpdateDraftFiling(
      businessStore.businessIdentifier!,
      payload,
      false,
      draftId as string | number
    )
  }

  async function submit(draftId?: string) {
    const liquidatorPayload: LiquidatorPayload = {
      ...(newParties.value
        ? {
          appointedLiquidators: {
            parties: newParties.value.map(p =>
              formatPartyApi(p.new as PartyStateBase)
            ) || []
          }
        }
        : {}),
      ...(ceasedParties.value
        ? {
          ceasedLiquidators: {
            parties: ceasedParties.value.map(p =>
              formatPartyApi(p.new as PartyStateBase)
            ) || []
          }
        }
        : {})
    }

    const payload = businessApi.createFilingPayload<{ changeOfLiquidators: LiquidatorPayload }>(
      businessStore.business!,
      // TODO: Need to figure out subtypes / what to put here for a combined filing for subtype
      FilingType.CHANGE_OF_LIQUIDATORS,
      { changeOfLiquidators: liquidatorPayload },
      formState.staffPayment
    )
    if (draftId) {
      await businessApi.saveOrUpdateDraftFiling(
        businessStore.businessIdentifier!,
        payload,
        true,
        draftId
      )
    } else {
      await businessApi.postFiling(businessStore.businessIdentifier!, payload)
    }
  }

  function $reset() {
    const emptyObj = liquidatorSchema.parse({})
    formState.activeParty = undefined
    formState.courtOrder = emptyObj.courtOrder
    formState.documentId = emptyObj.documentId
    formState.recordsAddress = emptyObj.recordsAddress
    formState.staffPayment = emptyObj.staffPayment
  }

  return {
    formState,
    initializing,
    init,
    save,
    submit,
    $reset
  }
})
