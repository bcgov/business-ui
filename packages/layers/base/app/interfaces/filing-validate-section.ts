export interface FilingValidateSectionError {
  error: string
  path: string
}

export interface FilingValidateSectionRequest<T = Record<string, unknown>> {
  filingType: FilingType
  section: string
  data: T
  filingSubType?: FilingSubType
}

export interface FilingValidateSectionResponse {
  isValid: boolean
  errors: FilingValidateSectionError[]
}
