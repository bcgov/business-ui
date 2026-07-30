/** Response object from BusinessService.postDocument(). */
export interface DocumentUploadResponse {
  /** The file key to store in the filing, eg "CORP-DS0100001003" */
  key: string
  documentServiceId: string
}