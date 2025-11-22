import type { ManageReceiversSchema } from '~/utils/schemas/forms/manage-receivers'
import type { ExpandedState } from '@tanstack/vue-table'

export const useReceiverStore = defineStore('receiver-store', () => {
  const receiverSchema = getReceiversSchema()
  const activePartySchema = getActivePartySchema()

  const businessApi = useBusinessApi()
  const businessStore = useBusinessStore()

  const initializing = ref<boolean>(false) // receiver store loading state
  const draftFilingState = shallowRef<ManageReceiversSchema>({} as ManageReceiversSchema) // filing state saved as draft
  const addingReceiver = ref<boolean>(false) // flag to show/hide Add Receiver form
  const receiverTableState = shallowRef<TableBusinessState<PartySchema>[]>([]) // receiver state displayed in table
  const expandedReceiver = ref<ExpandedState | undefined>(undefined) // what table rows are expanded

  const formState = reactive<ReceiverFormSchema>(receiverSchema.parse({}))

  // function getEmptyFormState(): ManageReceiversSchema {
  //   return {
  //     staffPayment: {
  //       option: StaffPaymentOption.NONE,
  //       bcolAccountNumber: '',
  //       datNumber: '',
  //       routingSlipNumber: '',
  //       folioNumber: '',
  //       isPriority: false
  //     },
  //     parties: [],
  //     courtOrder: {
  //       hasPoa: undefined,
  //       courtOrderNumber: undefined
  //     }
  //   }
  // }

  // const formState = ref(getEmptyFormState())

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
      receiverPayload
      // formState.value.staffPayment
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
    // formState.value = getEmptyFormState()
  }

  // TODO: common party composable for (maybe this should be in the usePartyTableComposable?):
  function updateReceiverTable(newState: TableBusinessState<PartySchema>, row: TableBusinessRow<PartySchema>): void {
    const index = row.index

    receiverTableState.value = [
      ...receiverTableState.value.slice(0, index),
      newState,
      ...receiverTableState.value.slice(index + 1)
    ]
  }
  function initAddReceiver() {
    formState.activeParty = activePartySchema.parse({})
    addingReceiver.value = true
  }
  function cancelAddReceiver() {
    addingReceiver.value = false
    formState.activeParty = undefined
  }
  function initEditReceiver(row: TableBusinessRow<PartySchema>) {
    formState.activeParty = activePartySchema.parse({ ...row.original.new })
    expandedReceiver.value = { [row.index]: true }
  }
  function cancelEditReceiver() {
    expandedReceiver.value = undefined
    formState.activeParty = undefined
  }
  function addNewReceiver() {
    const newState = {
      new: {
        ...formState.activeParty!,
        actions: [ActionType.ADDED]
      },
      old: undefined
    }
    receiverTableState.value = [
      ...receiverTableState.value,
      newState
    ]
    addingReceiver.value = false
    formState.activeParty = activePartySchema.parse({})
  }
  function removeReceiver(row: TableBusinessRow<PartySchema>): void {
    const oldReceiver = row.original.old
    const newReceiver = row.original.new

    if (oldReceiver === undefined) {
      receiverTableState.value = [
        ...receiverTableState.value.slice(0, row.index),
        ...receiverTableState.value.slice(row.index + 1)
      ]
    } else {
      const newState = JSON.parse(JSON.stringify({
        new: { ...newReceiver, actions: [ActionType.REMOVED] },
        old: oldReceiver
      }))

      updateReceiverTable(newState, row)
    }
  }
  function undoReceiver(row: TableBusinessRow<PartySchema>): void {
    const oldReceiver = row.original.old

    if (oldReceiver) {
      const newState = JSON.parse(JSON.stringify({
        new: oldReceiver,
        old: oldReceiver
      }))
      updateReceiverTable(newState, row)
    }
  }
  function applyReceiverEdits(row: TableBusinessRow<PartySchema>): void {
    const oldReceiver = row.original.old

    // TODO: still need to map new actions
    const newState = JSON.parse(JSON.stringify({
      old: oldReceiver,
      new: formState.activeParty
    }))

    updateReceiverTable(newState, row)
    cancelEditReceiver()
  }

  return {
    formState,
    initializing,
    addingReceiver,
    receiverTableState,
    expandedReceiver,
    init,
    save,
    submit,
    initAddReceiver,
    cancelAddReceiver,
    initEditReceiver,
    cancelEditReceiver,
    addNewReceiver,
    removeReceiver,
    undoReceiver,
    applyReceiverEdits,
    $reset
  }
})
