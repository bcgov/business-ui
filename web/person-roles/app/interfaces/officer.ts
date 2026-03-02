export interface OfficersPayload extends FilingPayloadData {
  relationships: BusinessRelationship[]
}

export interface ChangeOfOfficers {
  changeOfOfficers: OfficersPayload
}

export type OfficersDraftState = FilingGetByIdResponse<ChangeOfOfficers>
