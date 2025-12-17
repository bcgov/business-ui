// Define a type for the document request parameters
export interface DocumentRecordRequest {
  pageNumber?: number
  documentServiceId?: string
  consumerDocumentId?: string
  documentClass?: string
  documentType?: string
  description?: string
  consumerIdentifier?: string
  consumerReferenceId?: string
  consumerFilingDate?: string
  consumerFilename?: string
  productCode?: string
  documentURL?: string
  queryStartDate?: string
  queryEndDate?: string
}

// Define a type for the document search RO
export interface DocumentRecord {
  author: string
  consumerDocumentId: string
  consumerFilename: string
  consumerFilingDateTime: string
  consumerIdentifier: string
  consumerReferenceId?: string // Will map to filingId: Conditionally returned by the API
  createDateTime: string
  description: string
  documentClass: string
  documentServiceId: string
  documentType: string
  documentTypeDescription: string
  documentURL: string
}
