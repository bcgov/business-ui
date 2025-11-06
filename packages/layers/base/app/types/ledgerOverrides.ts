export type OverrideGetFilingDocumentUrlsFn = (
  businessId: string,
  filingId: number | string
) => Promise<BusinessFilingDocumentUrls>

export type OverrideGetDocumentDownloadFn = (
  doc: BusinessDocument,
  businessId: string,
  filingId: number | string
) => Promise<Blob>
