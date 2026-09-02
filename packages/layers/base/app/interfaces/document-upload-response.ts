/** full response type from drs api */
export interface DocumentUploadResponse {
  author: string
  consumerDocumentId: string
  consumerFilename: string
  consumerIdentifier: string
  consumerReferenceId: string
  createDateTime: string
  documentClass: string // "CORP"
  /** The DRS document service id, eg "DS0100001003" */
  documentServiceId: string // "DS0000102166"
  documentType: DocumentTypeDrs // "CRTO"
  documentTypeDescription: string // "Court Orders"
  documentURL: string
  /** The file key to store in the filing, eg "CORP-DS0100001003" (or a Minio key on the legacy flow). */
  key: string // "CORP-DS0000102166"
}
