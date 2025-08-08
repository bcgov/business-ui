type Offices = IncorporationAddress

interface ShareStructure {
  shareClasses: Share[]
}

interface ContactPoint {
  email: string
  phone?: string
  extension?: string
}

// Transition interface
export interface StandaloneTransition {
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
