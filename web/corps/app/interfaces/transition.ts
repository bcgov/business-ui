export interface TransitionPayload extends FilingPayloadData {
  hasProvisions: boolean
  relationships: BusinessRelationship[]
  offices: IncorporationAddress
  shareStructure: {
    shareClasses: ShareClassSchema[]
  }
  contactPoint?: {
    email: string
  }
  // courtOrder: CourtOrder ???
  // nameTranslation ???
}
