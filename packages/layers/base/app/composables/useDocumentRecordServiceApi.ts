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

  return {
    getCorpDocuments
  }
}
