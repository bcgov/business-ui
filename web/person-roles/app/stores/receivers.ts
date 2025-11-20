import type { ManageReceiversSchema } from '~/utils/schemas/forms/manage-receivers'

export const useReceiverStore = defineStore('receiver-store', () => {
  const businessApi = useBusinessApi()
  const businessStore = useBusinessStore()

  const initializing = ref<boolean>(false) // officer store loading state
  const draftFilingState = shallowRef<ManageReceiversSchema>({} as ManageReceiversSchema) // filing state saved as draft

  function getEmptyFormState(): ManageReceiversSchema {
    return {
      staffPayment: {
        option: StaffPaymentOption.NONE,
        bcolAccountNumber: '',
        datNumber: '',
        routingSlipNumber: '',
        folioNumber: '',
        isPriority: false
      },
      parties: [],
      courtOrder: {
        hasPoa: undefined,
        courtOrderNumber: undefined
      }
    }
  }

  const formState = ref(getEmptyFormState())

  // TODO: watcher on these that updates fee summary OR added as part of compute fns
  const newParties = computed(() => formState.value.parties.filter(p => p.new?.actions.includes(ActionType.ADDED)))
  const ceasedParties = computed(() => formState.value.parties.filter(p => p.new?.actions.includes(ActionType.REMOVED)))

  async function init(businessId: string, draftId?: string) {
    initializing.value = true
    // reset any previous state (ex: user switches accounts) and init loading state
    $reset()
    const { draftFiling, parties } = await useFiling().init<ManageReceiversSchema>(
      businessId,
      FilingType.CHANGE_OF_RECEIVERS,
      draftId,
      { roleType: RoleType.RECEIVER })

    if (draftFiling?.data.value?.filing) {
      draftFilingState.value = draftFiling.data.value.filing
      formState.value = draftFiling.data.value.filing
    } else if (parties?.data) {
      formState.value.parties = parties.data
    }
    initializing.value = false
  }

  async function save(draftId?: string) {
    const payload = businessApi.createFilingPayload<ManageReceiversSchema>(
      businessStore.business!,
      FilingType.CHANGE_OF_RECEIVERS,
      { ...formState.value },
      formState.value.staffPayment
    )

    await businessApi.saveOrUpdateDraftFiling(
      businessStore.businessIdentifier!,
      payload,
      false,
      draftId as string | number
    )
  }

  async function submit(draftId?: string) {
    const receiverPayload: ReceiverPayload = {
      ...(newParties.value
        ? { appointedReceivers: { parties: newParties.value.map(p => formatPartyApi(p.new as PartyStateBase)) || [] } }
        : {}),
      ...(newParties.value
        ? { ceasedReceivers: { parties: ceasedParties.value.map(p => formatPartyApi(p.new as PartyStateBase)) || [] } }
        : {})
    }

    const payload = businessApi.createFilingPayload<ReceiverPayload>(
      businessStore.business!,
      // TODO: Need to figure out subtypes / what to put here for a combined filing for subtype
      FilingType.CHANGE_OF_RECEIVERS,
      receiverPayload,
      formState.value.staffPayment
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
    formState.value = getEmptyFormState()
  }

  // TODO: common party composable for (maybe this should be in the usePartyTableComposable?):
  // addParty
  // removeParty
  // updateParty
  // undoParty

  return {
    formState,
    initializing,
    init,
    save,
    submit,
    $reset
  }
})
