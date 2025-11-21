export interface ReceiverPayload extends FilingRecord {
  // NOTE: these may change depending on the API
  appointedReceiver?: {
    parties: OrgPerson[]
  }
  ceasedReceivers?: {
    parties: OrgPerson[]
  }
}
