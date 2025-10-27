/** Store for managing client documents  */
export const useDocumentRecordServiceStore = defineStore('document-record-service', () => {
  const { getCorpDocuments } = useDocumentRecordServiceApi()
  const { isAuthorized } = useBusinessPermissionsStore()
  const { getStoredFlag } = useConnectLaunchDarkly()

  /** Returns True if the user is a staff account and the document records feature flag is enabled */
  const enableDocumentRecords = computed(() => (
    isAuthorized(AuthorizedAction.DOCUMENT_RECORDS)
    && !!(getStoredFlag(LDFlag.EnableDocumentRecords).value)
  ))

  /** Array of DocumentRecord objects returned from the DRS API */
  const documents = shallowRef<DocumentRecord[]>([])

  const init = async (params: DocumentRecordRequest) => {
    if (enableDocumentRecords.value) {
      try {
        documents.value = await getCorpDocuments(params)
      } catch {
        documents.value = []
      }
    }
  }

  /**
   * Retrieves the consumerDocumentId of a document that matches the given filingId.
   *
   * @param documents - An array of Document objects to search through.
   * @param filingId - The filingId to match against the consumerReferenceId.
   * @returns The consumerDocumentId of the matching document, or undefined if no match is found.
  */
  const getDocIdByFilingId = (filingId: number): string | undefined => {
    const document = documents.value.find(doc => doc.consumerReferenceId === filingId.toString())
    return document?.consumerDocumentId
  }

  const $reset = () => {
    documents.value = []
  }

  return {
    documents,
    enableDocumentRecords,
    getDocIdByFilingId,
    init,
    $reset
  }
})
