export interface LiquidatorPayload extends FilingPayloadData {
  relationships: BusinessRelationship[]
  type: LiquidateType
  offices?: {
    liquidationRecordsOffice: {
      mailingAddress: ApiAddress
      deliveryAddress: ApiAddress
    }
  }
  changeOfLiquidatorsDate?: string // yyyy-mm-dd
}

export interface ChangeOfLiquidators {
  changeOfLiquidators: LiquidatorPayload
}

export type LiquidatorDraftState = FilingGetByIdResponse<ChangeOfLiquidators>

export type LiquidationRecordsOffice = Omit<LiquidatorFormSchema['recordsOffice'], 'sameAs'> | undefined
