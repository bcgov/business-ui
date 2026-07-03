export const useDrsService = () => {
  const { $documentRecordServiceApi } = useNuxtApp()
  /**
   * Sends a GET request to fetch a document from the specified API endpoint (Document Record Service).
   *
   * @param params - The parameters for the document request, including document class, type, and consumer information.
   * @returns A promise to return the list of documents.
  */
  function getCorpDocuments(params: DocumentRecordRequest) {
    return $documentRecordServiceApi<DocumentRecord[]>('/searches/CORP', { params })
  }

  /**
   * Verifies a document ID by making a request to the document record service API.
   *
   * @param {string} documentId - The document ID to verify.
   * @returns A promise to return a status code indicating whether the document ID is valid.
   */
  function getDocumentId(documentId: string) {
    return $documentRecordServiceApi.raw<boolean>(`/documents/verify/${documentId}`)
  }

  /**
   * Converts a document to PDF by sending a POST request to the PDF conversion API.
   *
   * ToDo: URL will need to be configurable to support client uploads - clients cannot directly call the drs api.
   * @param document - The document data to be converted, conforming to { [key: string]: unknown }.
   * @returns A promise that resolves to a PDF blob on success, or an error object with message, and status on failure.
   */
  function convertDocumentToPdf(file: File) {
    return $documentRecordServiceApi<Blob>('/pdf-conversions', {
      method: 'POST',
      body: file
    })
  }

  return {
    convertDocumentToPdf,
    getCorpDocuments,
    getDocumentId
  }
}
