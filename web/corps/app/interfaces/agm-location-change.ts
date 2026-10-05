// https://github.com/bcgov/business-schemas/blob/main/src/registry_schemas/schemas/agm_location_change.json
export interface AgmLocationChangePayload extends FilingPayloadData {
  year: string
  reason: string
  agmLocation: string
}

export interface AgmLocationChangeFiling {
  agmLocationChange: AgmLocationChangePayload
}

export type AgmLocationChangeDraftState = FilingGetByIdResponse<AgmLocationChangeFiling>
