export const useDocumentRecordServiceApi = () => {
  const { $documentRecordServiceApi } = useNuxtApp()
  /**
   * Sends a GET request to fetch a document from the specified API endpoint (Document Record Service).
   *
   * @param params - The parameters for the document request, including document class, type, and consumer information.
   * @returns A promise to return the list of documents.
  */
  const getCorpDocuments = async (params: DocumentRecordRequest): Promise<DocumentRecord[]> => {
    return await $documentRecordServiceApi('/searches/CORP', { params })
  }

  /**
   * Verifies a document ID by making a request to the document record service API.
   *
   * @param {string} documentId - The document ID to verify.
   * @returns A promise to return a status code indicating whether the document ID is valid.
   */
  const getDocumentId = async (documentId: string): boolean => {
    return await $documentRecordServiceApi.raw(`/documents/verify/${documentId}`)
  }

  return {
    getCorpDocuments,
    getDocumentId
  }
}
