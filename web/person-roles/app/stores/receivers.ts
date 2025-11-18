import { isEqual } from 'es-toolkit'
import * as z from 'zod'

// TODO: consolidate with officers store and move common 'parties filing' stuff into a composable
export const useReceiverStore = defineStore('receiver-store', () => {
  const businessApi = useBusinessApi()
  const { setFilingDefault } = useBusinessTombstone()
  const businessStore = useBusinessStore()
  const modal = useOfficerModals()

  const initializing = ref<boolean>(false) // officer store loading state

  function getEmptyFormState() {
    return {
      header: {} as Partial<FilingHeaderSubmission & StaffPayment>,
      parties: [] as BusinessPartyTableState[]
      // TODO - court order
    }
  }

  // TODO: update
  const formSchema = z.object({
    header: z.object(),
    parties: z.array(z.object())
  })
  const formState = ref(getEmptyFormState())

  // TODO: watcher on these that updates fee summary OR added as part of compute fns
  const newParties = computed(() => formState.value.parties.filter(p => p.new?.actions.includes(ActionType.ADDED)))
  const ceasedParties = computed(() => formState.value.parties.filter(p => p.new?.actions.includes(ActionType.REMOVED)))

  // TODO: correctionId option - will load in differently than drafts due to payload
  async function init(businessId: string, draftId?: string) {
    try {
      initializing.value = true
      // reset any previous state (ex: user switches accounts) and init loading state
      $reset()
      // throw error and show modal if invalid business ID
      if (businessId === 'undefined') {
        throw createError({ statusCode: 404 })
      }
      // set masthead data
      setFilingDefault(businessId)

      if (draftId) {
        try {
          // TODO: businessApi.getAndValidateDraftFiling requires filingName
          // which has complications for draft combined filing - need to figure out how this will work in the API first
          const resp = await businessApi.getFilingById<{ parties: BusinessPartyTableState[] }>(businessId, draftId)
          formState.value.parties = resp.filing.parties
        } catch (error) {
          await modal.openGetDraftFilingErrorModal(error)
          return
        }
      }

      // TODO: rework this so that we only get the parties when necessary
      // + combine await with draft
      // + don't need parties call when using a draft
      const [_, partiesResp] = await Promise.all([
        businessStore.init(businessId, false, false, true),
        businessApi.getParties(businessId, { role: RoleType.RECEIVER })
      ])

      // TODO: common parties store will remove the need for this
      if (partiesResp.status.value === 'pending') {
        await partiesResp.refresh()
      }
      if (partiesResp.error.value) {
        businessApi.handleError(partiesResp.error.value, 'errorModal.business.parties')
        return
      }

      if (!draftId) {
        // map current/existing parties
        formState.value.parties = partiesResp.data.value?.parties.map((p) => {
          const mailingAddress = formatAddressUi(p.mailingAddress)
          const deliveryAddress = formatAddressUi(p.deliveryAddress)
          const id = p.officer.id ? String(p.officer.id) : undefined

          // TODO: include roles? Need to either always include roles or update typing
          return {
            old: {
              id,
              officer: p.officer,
              mailingAddress,
              deliveryAddress,
              sameAsDelivery: isEqual(mailingAddress, deliveryAddress)
            }
          } as BusinessPartyTableState
        }) || []
      }
    } catch (error) {
      await modal.openInitOfficerStoreErrorModal(error)
    } finally {
      initializing.value = false
    }
  }

  // TODO: combine with submit and always submit the same payload? - need to discuss submission
  async function save(draftId?: string) {
    const payload = businessApi.createFilingPayload<ReceiverPayload>(
      businessStore.business!,
      // TODO: Need to figure out what to put here for a combined filing
      'receiver',
      { parties: formState.value.parties },
      formState.value.header
    )

    await businessApi.saveOrUpdateDraftFiling(
      businessStore.businessIdentifier!,
      payload,
      false,
      draftId
    )
  }

  async function submit(draftId?: string) {
    // TODO: validate here or in form or both
    const receiverPayload = {
      // TODO - conversion function for addresses and anything else
      ...(newParties.value ? { appointedReceivers: newParties.value.map(p => p.new) } : {}),
      ...(newParties.value ? { ceaseReceivers: ceasedParties.value.map(p => p.new) } : {})
    } as ReceiverPayload

    // TODO: fix typing in base so that we can pass in the payload interface directly
    const payload = businessApi.createFilingPayload<ReceiverPayload>(
      businessStore.business!,
      // TODO: Need to figure out what to put here for a combined filing
      'receiver',
      receiverPayload,
      formState.value.header
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
