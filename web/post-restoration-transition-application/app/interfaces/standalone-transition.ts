type Offices = IncorporationAddress

interface ShareStructure {
  shareClasses: Share[]
}

interface ContactPoint {
  email: string
  phone?: string
  extension?: string
}

// court order interface
// based on: https://github.com/bcgov/business-schemas/blob/main/src/registry_schemas/schemas/court_order.json
export interface CourtOrder {
  fileNumber: string // 5-20 characters
  effectOfOrder?: string // 0-500 characters; if plan of arrangement is selected, this equals to "planOfArrangement"
}

// Transition interface
export interface StandaloneTransition {
  courtOrder?: CourtOrder
  nameTranslations?: NameTranslation[]
  offices: Offices
  parties: OrgPerson[]
  shareStructure: ShareStructure
  hasProvisions: boolean
  contactPoint?: ContactPoint
}

// Main transition filing interface
export interface StandaloneTransitionFiling {
  transition: StandaloneTransition

  [key: string]: unknown
}
