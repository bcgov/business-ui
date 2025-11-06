export type OverrideGetDocumentFn = (
  doc: BusinessDocument,
  businessId: string,
  filingId: number | string
) => Promise<Blob>
