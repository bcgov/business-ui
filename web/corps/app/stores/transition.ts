import { cloneDeep } from 'es-toolkit'

export const useTransitionStore = defineStore('transition-store', () => {
  const { tableState: tableParties } = useManageParties()
  const { tableState: tableOffices } = useManageOffices()
  const { tableState: tableShareClasses } = useManageShareStructure()
  const { getPartiesMergedWithRelationships } = useBusinessParty()
  const { initFiling } = useFiling()

  const businessApi = useBusinessApi()
  const businessStore = useBusinessStore()

  const initializing = ref<boolean>(false)
  const draftFilingState = shallowRef<TransitionDraftState>({} as TransitionDraftState)

  const formState = reactive<TransitionFormSchema>({} as TransitionFormSchema)
  const initialFormState = shallowRef<TransitionFormSchema>({} as TransitionFormSchema)
  const initialDirectors = shallowRef<TableBusinessState<PartySchema>[]>([])
  const initialShareClasses = shallowRef<TableBusinessState<ShareClassSchema>[]>([])

  const isStaff = computed(() => useConnectAccountStore().currentAccount.accountType === AccountType.STAFF)

  async function init(businessId: string, draftId?: string) {
    initializing.value = true
    $reset()

    const { draftFiling, parties, addresses, shareClasses } = await initFiling<PRTApplication>(
      businessId,
      FilingType.TRANSITION,
      undefined,
      draftId,
      { roleType: RoleType.DIRECTOR },
      [OfficeType.RECORDS, OfficeType.REGISTERED],
      true // fetch share classes
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
        if (formState.certify) {
          formState.certify.legalName = draftFiling.filing.header.certifiedBy
        }
      }
    }

    if (parties) {
      const draftRelationships = draft?.relationships
      tableParties.value = draftRelationships
        ? getPartiesMergedWithRelationships(parties, draftRelationships)
        : parties
    }

    // offices are not editable, no need to map draft state
    if (addresses) {
      tableOffices.value = addresses
    }

    if (shareClasses) {
      const originalClasses = formatShareClassesUi(shareClasses)
      const draftClasses = draft?.shareStructure.shareClasses
        ? formatShareClassesUi(draft.shareStructure.shareClasses as unknown as ShareClass[])
        : undefined

      if (draftClasses) {
        for (const shareClass of draftClasses) {
          const classId = shareClass.new.id
          const existingClass = classId ? originalClasses.find(c => c.new.id === classId) : undefined
          if (existingClass) {
            shareClass.old = existingClass.new
          } else {
            shareClass.old = undefined
          }
        }
      }

      tableShareClasses.value = draftClasses || originalClasses
    }

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
        shareClasses: formatShareClassesApi(tableShareClasses.value, isSubmission)
      },
      ...(formState.documentDelivery?.completingPartyEmail && {
        contactPoint: { email: formState.documentDelivery.completingPartyEmail }
      })
    }

    const filingPayload = useFiling().createFilingPayload(
      businessStore.business!,
      FilingType.TRANSITION,
      { transition: transitionPayload },
      {
        ...(isStaff.value ? formatStaffPaymentApi(formState.staffPayment!) : {}),
        ...(!isStaff.value
          ? {
            certifiedBy: formState.certify?.legalName,
            folioNumber: formState.folio?.folioNumber
          }
          : {}
        )
      }
    )

    const draftId = draftFilingState.value?.filing?.header?.filingId
    if (draftId || !isSubmission) {
      const filingResp = await businessApi.saveOrUpdateDraftFiling<PRTApplication>(
        businessStore.businessIdentifier!,
        filingPayload,
        isSubmission,
        draftId as string | number
      )

      draftFilingState.value = filingResp as unknown as TransitionDraftState
      const urlParams = useUrlSearchParams()
      urlParams.draft = String(filingResp.filing.header.filingId)
    } else {
      await businessApi.postFiling(businessStore.businessIdentifier!, filingPayload)
    }
  }

  function $reset() {
    const defaults = getTransitionSchema(isStaff.value).parse({})
    Object.assign(formState, defaults)
    formState.activeDirector = undefined
    formState.activeClass = undefined
    formState.activeSeries = undefined
    formState.confirmDirectors = false
    formState.confirmOffices = false

    initialFormState.value = cloneDeep(formState)
    initialDirectors.value = []
    initialShareClasses.value = []
  }

  return {
    formState,
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
