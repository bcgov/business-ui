export interface LiquidatorPayload extends FilingRecord {
  // NOTE: these may change depending on the API
  appointedLiquidator?: {
    parties: OrgPerson[]
  }
  ceasedLiquidators?: {
    parties: OrgPerson[]
  }
}
