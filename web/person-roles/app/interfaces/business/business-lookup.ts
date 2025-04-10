export interface BusinessLookup {
  identifier: string
  name: string
  bn?: string
}

export interface BusinessLookupResult {
  bn?: string
  identifier: string
  legalType: CorpTypeCd
  name: string
  score?: number
  status: EntityState
  disabled?: boolean
}
