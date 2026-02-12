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

  /**
   * Converts a document to PDF by sending a POST request to the PDF conversion API.
   *
   * ToDo: URL will need to be configurable to support client uploads - clients cannot directly call the drs api.
   * @param document - The document data to be converted, conforming to RequestDataIF.
   * @returns A promise that resolves to a PDF blob on success, or an error object with message, and status on failure.
   */
  const convertDocumentToPdf = async (document: RequestDataIF): Promise<ApiResponseOrError> => {
    const options = {
      method: 'POST',
      body: document
    }

    let response
    try {
      response = await $documentRecordServiceApi('/pdf-conversions', options)
      return response
    } catch (fetchError: Error) {
      throw new Error(`Failed to convert file to PDF. No Blob returned: ${fetchError}`)
    }
  }

  return {
    convertDocumentToPdf,
    getCorpDocuments,
    getDocumentId
  }
}
