/** Manages business bootstrap (temp reg) data */
export const useBusinessBootstrapStore = defineStore('business-bootstrap', () => {
  const { t } = useI18n()
  const { getBootstrapFiling, getLinkedNameRequest } = useBusinessApi()

  const bootstrapFiling = ref<FilingGetByIdResponse<BootstrapFiling> | undefined>(undefined)

  const linkedNr = ref<NameRequest | undefined>(undefined)
  const linkedNrInvalid = ref(false)
  const linkedNrInvalidType = ref<NameRequestState | undefined>(undefined)

  const bootstrapIdentifier = computed(() => bootstrapFiling.value?.filing.business.identifier)

  const bootstrapLegalType = computed(() => {
    return bootstrapFiling.value?.filing.business.legalType
      || bootstrapFiling.value?.filing?.incorporationApplication?.nameRequest?.legalType
  })

  type BootsrapFilingType = (FilingType.AMALGAMATION_APPLICATION
    | FilingType.CONTINUATION_IN
    | FilingType.INCORPORATION_APPLICATION
    | FilingType.REGISTRATION
  )
  const bootstrapFilingType = computed(() =>
    bootstrapFiling.value?.filing.header.name as BootsrapFilingType | undefined)

  const bootstrapFilingStatus = computed(() => bootstrapFiling.value?.filing.header.status)

  const bootstrapNr = computed(() => bootstrapFilingType.value
    ? bootstrapFiling.value?.filing[bootstrapFilingType.value]?.nameRequest
    : undefined)
  const bootstrapNrNumber = computed(() => bootstrapNr.value?.nrNumber)

  const isTodo = computed(() =>
    [
      FilingStatus.APPROVED,
      FilingStatus.CHANGE_REQUESTED,
      FilingStatus.DRAFT,
      FilingStatus.NEW,
      FilingStatus.PENDING
    ].includes(bootstrapFilingStatus.value as FilingStatus)
  )

  const isPending = computed(() => [FilingStatus.AWAITING_REVIEW].includes(bootstrapFilingStatus.value as FilingStatus))

  const bootstrapName = computed(() => {
    if (bootstrapNrNumber.value && (isTodo.value || isPending.value)) {
      // get approved name from the linked name request
      return linkedNr.value?.names.find(val => val.state === NameRequestState.APPROVED)?.name
    } else if (bootstrapNr?.value?.legalName) {
      return bootstrapNr.value.legalName
    } else {
      // return the numbered name description
      if (bootstrapFilingType.value === FilingType.AMALGAMATION_APPLICATION) {
        return t('label.numberedAmalgamatedCompany')
      }
      return getCorpNumberedDescription(bootstrapLegalType.value as CorpTypeCd)
    }
  })

  const loadLinkedNameRequest = async (nrNumber: string) => {
    if (!nrNumber) {
      return
    }
    // reset name request error variables before fetching new data
    linkedNrInvalid.value = false
    linkedNrInvalidType.value = undefined

    const nameRequest = await getLinkedNameRequest(nrNumber)

    // check if the NR is invalid, or if the NR type does not match the entity type of this bootstrap filing
    if (isNrInvalid(nameRequest) || nameRequest.legalType !== bootstrapLegalType.value) {
      linkedNrInvalid.value = true
      return
    }

    // if IA is not yet completed, the NR should be consumable
    if (bootstrapFilingStatus.value !== FilingStatus.COMPLETED) {
      const nrState = getNrState(nameRequest)
      if (nrState !== NameRequestState.APPROVED && nrState !== NameRequestState.CONDITIONAL) {
        linkedNrInvalid.value = true
        linkedNrInvalidType.value = nrState
        return
      }
    }

    linkedNr.value = nameRequest
  }

  const loadBootstrap = async (tempRegId: string, force = false) => {
    const bootstrapCached = bootstrapIdentifier.value === tempRegId
    if (!bootstrapCached || force) {
      bootstrapFiling.value = await getBootstrapFiling(tempRegId)
      if (bootstrapNrNumber.value && (isPending.value || isTodo.value)) {
        await loadLinkedNameRequest(bootstrapNrNumber.value)
      }
    }
  }

  return {
    bootstrapFiling,
    bootstrapIdentifier,
    bootstrapName,
    loadBootstrap
  }
})
