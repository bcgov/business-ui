// https://github.com/bcgov/business-schemas/blob/main/src/registry_schemas/schemas/change_of_directors.json
export interface CODPayload extends FilingPayloadData {
  relationships: BusinessRelationship[]
}

export interface CODFiling {
  changeOfDirectors: CODPayload
}

// https://github.com/bcgov/business-schemas/blob/main/src/registry_schemas/schemas/change_of_address.json
// NB: legalType is schema required and non-CP businesses must send both offices, each with both
// addresses - a coop only ever sends the registered office
export interface COAPayload extends FilingPayloadData {
  legalType: CorpTypeCd
  offices: Partial<Record<OfficeType, ApiBaseAddressObj>>
}

export interface COAFiling {
  changeOfAddress: COAPayload
}
