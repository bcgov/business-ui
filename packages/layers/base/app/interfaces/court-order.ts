/**
 * See:
 * https://github.com/bcgov/business-schemas/blob/master/src/registry_schemas/schemas/court_order.json
 */
export interface CourtOrder {
  fileNumber: string
  orderDate?: string
  effectOfOrder?: string
  hasPlanOfArrangement?: boolean
  orderText?: string
  files?: unknown[]
}

export interface CourtOrderResponse {
  effectOfOrder?: string | null
  fileNumber: string
  filingId: number
  filingType: FilingType
  id: number
  orderDate?: string | null
  orderDetails?: string | null
  files?: unknown[] // FUTURE - not returned from API yet
}
