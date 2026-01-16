export interface ReceiverPayload extends FilingPayloadData {
  relationships: BusinessRelationship[]
  type: ReceiverType
}

export interface ChangeOfReceivers {
  changeOfReceivers: ReceiverPayload
}

export type ReceiverDraftState = FilingGetByIdResponse<ChangeOfReceivers>
