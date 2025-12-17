export interface ReceiverPayload extends FilingPayloadData {
  relationships: BusinessRelationship[]
  type: ReceiverType
}
