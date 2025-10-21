import iso3166 from 'iso-3166-2'

export const useBusinessLedger = (filing: BusinessLedgerItem) => {
  const { t, te } = useNuxtApp().$i18n
  const { getFilingComments, getFilingDocumentUrls } = useBusinessApi()

  const createFilingState = () => ({
    ...filing,
    comments: filing.comments || [],
    documents: filing.documents || []
  })

  const ledgerItem = useState<BusinessLedgerItem>(String(filing.filingId), createFilingState)

  const isFilingType = (
    filingType?: FilingType,
    filingSubtype?: FilingSubType
  ) => {
    return (filingSubtype && filingSubtype === ledgerItem.value.filingSubType)
      // only match on filingType if filingSubtype was not given
      || (!filingSubtype && filingType && filingType === ledgerItem.value.name)
  }

  const isStaffFiling = (
    isFilingType(FilingType.ADMIN_FREEZE)
    || isFilingType(undefined, FilingSubType.DISSOLUTION_ADMINISTRATIVE)
    || isFilingType(FilingType.PUT_BACK_ON)
    || isFilingType(FilingType.REGISTRARS_NOTATION)
    || isFilingType(FilingType.REGISTRARS_ORDER)
  )

  const isCourtOrder = isFilingType(FilingType.COURT_ORDER)
  const isChangeOfOfficers = isFilingType(FilingType.CHANGE_OF_OFFICERS)

  const isFilingStatus = (filingStatus: FilingStatus) => ledgerItem.value.status === filingStatus

  const isFutureEffectiveAndPaid = isFilingStatus(FilingStatus.PAID) && ledgerItem.value.isFutureEffective

  /** Whether this ledgerItem was Future Effective and is past its effective date (overdue). */
  const isFutureEffectiveAndPending = (
    isFutureEffectiveAndPaid
    && ledgerItem.value.effectiveDate
    && (new Date(ledgerItem.value.effectiveDate) < new Date())
  )

  /** Whether this ledgerItem is Future Effective and is NOT past its effective date. */
  const isFutureEffective = (
    isFutureEffectiveAndPaid
    && !!ledgerItem.value.effectiveDate
    && !!(new Date(ledgerItem.value.effectiveDate) > new Date())
  )

  const foreignJurisdictionCountry = (
    filing.data?.consentAmalgamationOut?.country?.toUpperCase()
    || filing.data?.consentContinuationOut?.country?.toUpperCase()
    || filing.data?.amalgamationOut?.country?.toUpperCase()
    || filing.data?.continuationOut?.country?.toUpperCase()
  )

  const regionShortCode = (
    filing.data?.consentAmalgamationOut?.region?.toUpperCase()
    || filing.data?.consentContinuationOut?.region?.toUpperCase()
    || filing.data?.amalgamationOut?.region?.toUpperCase()
    || filing.data?.continuationOut?.region?.toUpperCase()
  )

  const getRegionName = (countryShortCode: string, regionShortCode: string) =>
    regionShortCode.toUpperCase() === 'FEDERAL'
      ? 'Federal'
      : iso3166.subdivision(countryShortCode, regionShortCode)?.name

  const foreignJurisdiction = computed(() => {
    const countryName = iso3166.country(foreignJurisdictionCountry || '')?.name
    if (
      regionShortCode
      && regionShortCode.toUpperCase() !== 'FEDERAL'
      && (foreignJurisdictionCountry === 'CA' || foreignJurisdictionCountry === 'US')
    ) {
      const regionName = getRegionName(foreignJurisdictionCountry, regionShortCode)
      return regionName + ', ' + countryName
    } else {
      return countryName
    }
  })

  /**
   * Add a new BusinessDocument to the ledger item documents list
   * @param filing
   * @param title
   * @param filename
   * @param link
   */
  const pushDocument = (title?: string, filename?: string, link?: string) => {
    if (title && filename && link) {
      ledgerItem.value.documents?.push({ title, filename, link })
    } else {
      console.error(`invalid document = ${title} | ${filename} | ${link}`)
    }
  }

  /**
   * If the filing has documentsLink but the documents list is empty, load the documents list
   * @param filing the filing object
   */
  const loadDocuments = async (hideReceipts?: boolean): Promise<void> => {
    const unknownStr = `[${t('label.unknown')}]`
    const businessIdentifier = ledgerItem.value.businessIdentifier
    if (!ledgerItem.value.documents?.length && ledgerItem.value.documentsLink) {
      try {
        const documentUrls = await getFilingDocumentUrls(
          businessIdentifier,
          String(ledgerItem.value.filingId)
        )
        for (const key in documentUrls) {
          if (hideReceipts && key === 'receipt') {
            continue
          }
          if (key === 'legalFilings' && Array.isArray(documentUrls.legalFilings)) {
            // iterate over legalFilings array
            for (const legalFilings of documentUrls.legalFilings) {
              // iterate over legalFilings properties
              for (const legalFiling in legalFilings) {
                // this is a legal filing output
                const title = legalFiling === filing.name
                  ? filing.displayName
                  : te(`filingName.${legalFiling}`)
                    ? t(`filingName.${legalFiling}`)
                    : ''

                const date = toDateStr(new Date(filing.paymentDate || filing.submittedDate))
                const filename = `${businessIdentifier} ${title} - ${date}.pdf`
                const link = legalFilings[legalFiling]
                pushDocument(title, filename, link)
              }
            }
          } else if (key === 'staticDocuments' && Array.isArray(documentUrls.staticDocuments)) {
            // iterate over staticDocuments array
            for (const document of documentUrls.staticDocuments) {
              const title = document.name
              const filename = title
              const link = document.url
              pushDocument(title, filename, link)
            }
          } else if (key === 'uploadedCourtOrder') {
            const fileNumber = filing.data?.order?.fileNumber || unknownStr
            const title = isCourtOrder ? `${filing.displayName} ${fileNumber}` : `${filing.displayName}`
            const filename = title
            const link = documentUrls[key] as string
            pushDocument(title, filename, link)
          } else if (key === 'letterOfConsentAmalgamationOut') {
            // this is a special case for Amalgamation Out Letter of Consent
            const title = 'Letter of Consent'
            const date = toDateStr(new Date(filing.paymentDate || filing.submittedDate))
            const filename = `${businessIdentifier} ${title} - ${date}.pdf`
            const link = documentUrls[key] as string
            pushDocument(title, filename, link)
          } else {
            // this is a submission level output
            const title = camelCaseToWords(key)
            const date = toDateStr(new Date(filing.paymentDate || filing.submittedDate))
            const filename = `${businessIdentifier} ${title} - ${date}.pdf`
            const link = documentUrls[key] as string
            pushDocument(title, filename, link)
          }
        }
      } catch (error) {
        // set property to null to retry next time
        ledgerItem.value.documents = []
        console.error('loadDocumentList() error =', error)
      }
    }
  }

  const loadComments = async (): Promise<void> => {
    try {
      if (ledgerItem.value.commentsCount && ledgerItem.value.commentsLink && !comments.value.length) {
        ledgerItem.value.comments = await getFilingComments(ledgerItem.value.commentsLink)
      }
    } catch (error) {
      ledgerItem.value.comments = []
      console.info('loadComments() error =', error)
    }
  }

  const comments = computed(() => ledgerItem.value.comments || [])
  const documents = computed(() => ledgerItem.value.documents || [])

  return {
    comments,
    documents,
    foreignJurisdiction,
    isChangeOfOfficers,
    isCourtOrder,
    isFutureEffective,
    isFutureEffectiveAndPending,
    isStaffFiling,
    isFilingType,
    isFilingStatus,
    loadComments,
    loadDocuments
  }
}
