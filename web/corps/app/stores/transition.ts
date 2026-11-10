import { cloneDeep } from 'es-toolkit'

export const useTransitionStore = defineStore('transition-store', () => {
  const { tableState: tableParties } = useManageParties()
  const { tableState: tableOffices } = useManageOffices()
  const { shareClasses: tableShareClasses } = useManageShareStructure()
  const { initFiling, formatFilingPayloadApi, saveOrSubmitFiling } = useFiling()

  const businessStore = useBusinessStore()

  const initializing = ref<boolean>(false)
  const draftFilingState = shallowRef<TransitionDraftState>({} as TransitionDraftState)

  const formState = reactive<TransitionFormSchema>({} as TransitionFormSchema)
  const initialFormState = shallowRef<TransitionFormSchema>({} as TransitionFormSchema)
  const initialDirectors = shallowRef<TableBusinessState<PartySchema>[]>([])
  const initialShareClasses = shallowRef<TableBusinessState<ShareClassSchema>[]>([])

  const isStaff = useIsStaff()

  async function init(businessId: string, draftId?: string) {
    initializing.value = true
    $reset()

    const { draftFiling, parties, addresses, shareClasses = [] } = await initFiling<PRTApplication>(
      businessId,
      FilingType.TRANSITION,
      {
        draftId,
        parties: { roleType: RoleType.DIRECTOR },
        offices: [OfficeType.RECORDS, OfficeType.REGISTERED],
        mergeDraftOffices: false, // offices are not editable in a transition
        shareClasses: true
      }
    )

    const draft = draftFiling?.filing?.transition
    if (draft) {
      draftFilingState.value = draftFiling
      if (formState.documentDelivery) {
        formState.documentDelivery.completingPartyEmail = draft.contactPoint?.email ?? ''
      }
      if (isStaff.value) {
        formState.staffPayment = formatStaffPaymentUi(draftFiling.filing.header)
      } else {
        if (formState.folio) {
          formState.folio.folioNumber = draftFiling.filing.header.folioNumber
        }
      }
    }

    if (parties) {
      tableParties.value = parties
    }

    if (addresses) {
      tableOffices.value = addresses
    }

    tableShareClasses.value = shareClasses

    await nextTick()
    initialFormState.value = cloneDeep(formState)
    initialDirectors.value = cloneDeep(tableParties.value)
    initialShareClasses.value = cloneDeep(tableShareClasses.value)
    initializing.value = false
  }

  async function submit(isSubmission: boolean) {
    const regOffice = tableOffices.value.find(o => o.new.type === OfficeType.REGISTERED)?.new.address
    const recOffice = tableOffices.value.find(o => o.new.type === OfficeType.RECORDS)?.new.address

    const transitionPayload: TransitionPayload = {
      relationships: tableParties.value.map(relationship => formatRelationshipApi(relationship.new)),
      offices: {
        registeredOffice: formatOfficeApi(regOffice),
        recordsOffice: formatOfficeApi(recOffice)
      },
      hasProvisions: true,
      shareStructure: {
        shareClasses: formatShareClassesApi(tableShareClasses.value)
      },
      ...(formState.documentDelivery?.completingPartyEmail && {
        contactPoint: { email: formState.documentDelivery.completingPartyEmail }
      })
    }

    const filingPayload = formatFilingPayloadApi(
      businessStore.business!,
      FilingType.TRANSITION,
      { transition: transitionPayload },
      {
        ...(isStaff.value ? formatStaffPaymentApi(formState.staffPayment!) : {}),
        ...(!isStaff.value
          ? {
            folioNumber: formState.folio?.folioNumber
          }
          : {}
        )
      }
    )

    const filingResp = await saveOrSubmitFiling<PRTApplication>(businessStore.businessIdentifier!, filingPayload, {
      isSubmission,
      draftId: draftFilingState.value?.filing?.header?.filingId
    })
    if (filingResp) {
      draftFilingState.value = filingResp as unknown as TransitionDraftState
    }
  }

  function $reset() {
    draftFilingState.value = {} as TransitionDraftState
    const defaults = getTransitionSchema(isStaff.value).parse({})
    Object.assign(formState, defaults)
    formState.activeDirector = undefined
    formState.activeShareStructure = undefined
    formState.confirmDirectors = false
    formState.confirmOffices = false

    initialFormState.value = cloneDeep(formState)
    initialDirectors.value = []
    initialShareClasses.value = []
  }

  return {
    formState,
    draftFilingState,
    initializing,
    directors: tableParties,
    offices: tableOffices,
    shareClasses: tableShareClasses,
    initialFormState,
    initialDirectors,
    initialShareClasses,
    isStaff,
    init,
    submit,
    $reset
  }
})
