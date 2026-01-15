/** Manages business bootstrap (temp reg) data */
export const useBusinessBootstrapStore = defineStore('business-bootstrap-store', () => {
  const { t } = useI18n()
  const { businessApiUrl, businessApiVersion } = useRuntimeConfig().public
  const { getBootstrapFiling, getLinkedNameRequest } = useBusinessApi()
  const { getFilingName } = useFiling()

  const bootstrapFiling = shallowRef<FilingGetByIdResponse<BootstrapFiling> | undefined>(undefined)

  const linkedNr = shallowRef<NameRequest | undefined>(undefined)
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

  const init = async (tempRegId: string, force = false) => {
    const bootstrapCached = bootstrapIdentifier.value === tempRegId
    if (!bootstrapCached || force) {
      bootstrapFiling.value = await getBootstrapFiling(tempRegId)
      if (bootstrapNrNumber.value && (isPending.value || isTodo.value)) {
        await loadLinkedNameRequest(bootstrapNrNumber.value)
      }
    }
  }

  const getBootstrapLedgerItems = () => {
    if (!bootstrapFiling.value || isTodo.value || isPending.value) {
      return []
    }
    const header = bootstrapFiling.value.filing.header
    const data = (header.name in bootstrapFiling.value.filing
      // @ts-expect-error we know header.name will be in the bootstrapFiling.value.filing in this case
      ? bootstrapFiling.value.filing[header.name]
      : undefined
    )
    const status = header?.status
    const description = getCorpFullDescription(data.nameRequest.legalType)
    const filingName = getFilingName(header?.name as FilingType, data.type, undefined, status)
    const displayName = header?.name === FilingType.AMALGAMATION_APPLICATION
      ? filingName
      : `${description} ${filingName}`
    // @ts-expect-error FUTURE properly type notice of withdrawal
    const noticeOfWithdrawal = bootstrapFiling.value?.filing.noticeOfWithdrawal?.filing || null

    const effectiveDate = toDate(header?.effectiveDate || '')
    const paymentDate = toDate(header?.date || '')
    const submittedDate = toDate(header?.date || '')
    const ledgerItems = [{
      availableOnPaperOnly: header?.availableOnPaperOnly,
      businessIdentifier: bootstrapFiling.value?.filing.business.identifier,
      commentsCount: bootstrapFiling.value?.commentsCount,
      commentsLink: bootstrapFiling.value?.commentsLink,
      displayLedger: bootstrapFiling.value?.displayLedger,
      displayName,
      documentsLink: bootstrapFiling.value?.documentsLink,
      effectiveDate: effectiveDate ? effectiveDate.toUTCString() : undefined,
      filingId: header?.filingId,
      filingLink: bootstrapFiling.value?.filingLink,
      filingSubType: data.type,
      isFutureEffective: bootstrapFiling.value?.isFutureEffective,
      name: header?.name,
      paymentDate: paymentDate ? paymentDate.toUTCString() : undefined,
      status: status,
      submittedDate: submittedDate ? submittedDate.toUTCString() : undefined,
      submitter: header?.submitter,
      withdrawalPending: bootstrapFiling.value?.withdrawalPending,
      data: {
        applicationDate: submittedDate ? toDateStr(submittedDate) : undefined,
        legalFilings: [header?.name],
        order: data.courtOrder,
        withdrawnDate: noticeOfWithdrawal?.header.effectiveDate || null
      },
      latestReviewComment: header?.latestReviewComment
    }] as BusinessLedgerItem[]

    if (noticeOfWithdrawal) {
      const header = noticeOfWithdrawal.header
      const business = noticeOfWithdrawal.business
      const displayName = getFilingName(header.name, undefined, undefined, header.status)
      const legalApiURL = businessApiUrl + businessApiVersion
      const filingLink = `${legalApiURL}/businesses/${business.identifier}/filings/${header.filingId}`
      const commentsLink = `${filingLink}/comments`
      const documentsLink = `${filingLink}/documents`

      // If the NoW is not in draft status, add it to the filings history list
      const effectiveDate = toDate(header?.effectiveDate || '')
      const paymentDate = toDate(header?.date || '')
      const submittedDate = toDate(header?.date || '')
      if (header.status !== FilingStatus.DRAFT && header.status !== FilingStatus.PENDING) {
        ledgerItems.unshift({
          availableOnPaperOnly: header.availableOnPaperOnly,
          businessIdentifier: business.identifier,
          commentsCount: header.comments?.length,
          commentsLink,
          displayLedger: bootstrapFiling.value?.displayLedger,
          displayName,
          documentsLink,
          effectiveDate: effectiveDate ? effectiveDate.toUTCString() : undefined,
          filingId: header.filingId,
          filingLink,
          isFutureEffective: false,
          name: header.name,
          paymentDate: paymentDate ? paymentDate.toUTCString() : undefined,
          status: header.status,
          submittedDate: submittedDate ? submittedDate.toUTCString() : undefined,
          submitter: header.submitter,
          data: {
            applicationDate: submittedDate ? toDateStr(submittedDate) : undefined,
            legalFilings: [header?.name],
            order: noticeOfWithdrawal.noticeOfWithdrawal.courtOrder
          },
          latestReviewComment: header.latestReviewComment
        } as BusinessLedgerItem)
      }
    }
    return ledgerItems
  }

  const $reset = () => {
    bootstrapFiling.value = undefined
    linkedNr.value = undefined
    linkedNrInvalid.value = false
    linkedNrInvalidType.value = undefined
  }

  return {
    bootstrapFiling,
    bootstrapIdentifier,
    bootstrapName,
    getBootstrapLedgerItems,
    init,
    $reset
  }
})
