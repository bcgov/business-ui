import * as z from 'zod'

export const useReceiverStore = defineStore('receiver-store', () => {
  const businessApi = useBusinessApi()
  const businessStore = useBusinessStore()
  const { staffPaymentSchema } = useStaffPaymentStore()

  const initializing = ref<boolean>(false) // officer store loading state
  const draftFilingState = shallowRef<ReceiverPayloadDraft>({} as ReceiverPayloadDraft) // filing state saved as draft

  function formSchema() {
    // TODO: update
    return z.object({
      staffPayment: staffPaymentSchema,
      parties: z.array(z.object({}))
    })
  }
  type ReceiverFilingSchema = z.output<ReturnType<typeof formSchema>>

  function getEmptyFormState(): ReceiverFilingSchema {
    return {
      staffPayment: {
        option: StaffPaymentOption.NONE,
        bcolAccountNumber: '',
        datNumber: '',
        routingSlipNumber: '',
        folioNumber: '',
        isPriority: false
      },
      parties: []
      // TODO - court order
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
    const { draftFiling, parties } = await useFiling().init<ReceiverPayloadDraft>(
      businessId,
      FilingType.CHANGE_OF_RECEIVER,
      draftId,
      { roleType: RoleType.RECEIVER })

    if (draftFiling?.data.value?.filing) {
      draftFilingState.value = draftFiling.data.value.filing
      formState.value.parties = draftFiling.data.value.filing.parties
    } else if (parties?.data) {
      formState.value.parties = parties.data
    }
    initializing.value = false
  }

  async function save(draftId?: string) {
    const payload = businessApi.createFilingPayload<ReceiverPayload>(
      businessStore.business!,
      FilingType.CHANGE_OF_RECEIVERS,
      { parties: formState.value.parties },
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
    const receiverPayload = {
      // TODO - conversion function for addresses and anything else
      ...(newParties.value ? { appointedReceivers: newParties.value.map(p => p.new) } : {}),
      ...(newParties.value ? { ceaseReceivers: ceasedParties.value.map(p => p.new) } : {})
    } as ReceiverPayload

    // TODO: fix typing in base so that we can pass in the payload interface directly
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
    formSchema,
    formState,
    initializing,
    init,
    save,
    submit,
    $reset
  }
})
