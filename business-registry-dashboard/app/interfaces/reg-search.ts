export interface RegSearchPayload {
  query: {
    value?: string
    name?: string
    identifier?: string
    bn?: string
    parties?: { partyName: string }
  }
  categories: {
    status?: BusinessState[]
    legalType?: CorpTypes[]
  },
  rows?: number
  start?: number
}

export interface RegSearchResult {
  name: string
  identifier: string
  bn: string
  status: BusinessState.ACTIVE | BusinessState.HISTORICAL
  legalType: CorpTypes
}

// api responses
export interface RegSearchResponse {
  facets?: FacetsResult
  searchResults: {
    queryInfo: RegSearchPayload
    results: RegSearchResult[]
    totalResults: number
  }
  error?: Error
}

export interface Facet {
  count: number
  parentCount?: number
  value: string
}

export interface FacetsResult {
  fields?: {
    entityType: Facet[]
    legalType: Facet[]
    relatedEntityType: Facet[]
    relatedLegalType: Facet[]
    relatedState: Facet[]
    roleType: Facet[]
    state: Facet[]
  }
}

export interface ManageBusinessEvent {
  bn: string
  identifier: string
  legalType: string
  name: string
  score: number
  status: string
}
