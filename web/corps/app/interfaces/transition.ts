// https://github.com/bcgov/business-schemas/blob/main/src/registry_schemas/schemas/transition.json
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

export interface PRTApplication {
  transition: TransitionPayload
}

export type TransitionDraftState = FilingGetByIdResponse<PRTApplication>
