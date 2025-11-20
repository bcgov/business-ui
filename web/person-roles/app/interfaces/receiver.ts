export interface ReceiverPayload extends FilingRecord {
  // NOTE: these may change depending on the API
  appointReceiver?: {
    parties: OrgPerson[]
  }
  ceaseReceiver?: {
    parties: OrgPerson[]
  }
}
