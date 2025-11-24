import type { ManageReceiversSchema } from '~/utils/schemas/forms/manage-receivers'
import { tableData } from '../pages/manage-receivers/data'

export const useReceiverStore = defineStore('receiver-store', () => {
  const receiverSchema = getReceiversSchema()
  const { tableState } = useManageParties()

  const businessApi = useBusinessApi()
  const businessStore = useBusinessStore()

  const initializing = ref<boolean>(false) // receiver store loading state
  const draftFilingState = shallowRef<ManageReceiversSchema>({} as ManageReceiversSchema) // filing state saved as draft

  watch(initializing, (v) => {
    if (v) {
      tableState.value = tableData
    }
  })

  const formState = reactive<ReceiverFormSchema>(receiverSchema.parse({}))

  // TODO: watcher on these that updates fee summary OR added as part of compute fns
  // const newParties = computed(() => formState.value.parties.filter(p => p.new?.actions.includes(ActionType.ADDED)))
  // const ceasedParties = computed(() => formState.value.parties.filter(p => p.new?.actions.includes(ActionType.REMOVED)))

  async function init(businessId: string, draftId?: string) {
    initializing.value = true
    // reset any previous state (ex: user switches accounts) and init loading state
    $reset()
    const { draftFiling, parties } = await useFiling().initFiling<ManageReceiversSchema>(
      businessId,
      FilingType.CHANGE_OF_RECEIVERS,
      draftId,
      { roleType: RoleType.RECEIVER })

    if (draftFiling?.data.value?.filing) {
      draftFilingState.value = draftFiling.data.value.filing
      // formState.value = draftFiling.data.value.filing
    } else if (parties?.data) {
      // formState.value.parties = parties.data
    }
    initializing.value = false
  }

  async function save(draftId?: string) {
    // const payload = businessApi.createFilingPayload<ManageReceiversSchema>(
    //   businessStore.business!,
    //   FilingType.CHANGE_OF_RECEIVERS,
    //   { ...formState.value },
    //   formState.value.staffPayment
    // )

    // await businessApi.saveOrUpdateDraftFiling(
    //   businessStore.businessIdentifier!,
    //   payload,
    //   false,
    //   draftId as string | number
    // )
  }

  async function submit(draftId?: string) {
    const receiverPayload: ReceiverPayload = {
      // ...(newParties.value
      //   ? { appointedReceivers: { parties: newParties.value.map(p => formatPartyApi(p.new as PartyStateBase)) || [] } }
      //   : {}),
      // ...(newParties.value
      //   ? { ceasedReceivers: { parties: ceasedParties.value.map(p => formatPartyApi(p.new as PartyStateBase)) || [] } }
      //   : {})
    }

    const payload = businessApi.createFilingPayload<ReceiverPayload>(
      businessStore.business!,
      // TODO: Need to figure out subtypes / what to put here for a combined filing for subtype
      FilingType.CHANGE_OF_RECEIVERS,
      receiverPayload,
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
    const emptyObj = receiverSchema.parse({})
    formState.activeParty = undefined
    formState.courtOrder = emptyObj.courtOrder
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
