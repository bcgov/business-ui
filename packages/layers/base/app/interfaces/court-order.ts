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

// class DocumentType(Enum):
//     """Document types."""

//     AFFIDAVIT = 'affidavit'
//     AUTHORIZATION_FILE = 'authorization_file'
//     CONTINUATION_OUT = 'continuation_out'
//     COOP_RULES = 'coop_rules'
//     COOP_MEMORANDUM = 'coop_memorandum'
//     COURT_ORDER = 'court_order'
//     DIRECTOR_AFFIDAVIT = 'director_affidavit'
//     SUPPORTING_DOCUMENT = 'supporting_document'

export interface CourtOrderDoc {
  fileName: string
  fileKey: string
  documentType: string
  url: string
}

export interface CourtOrderResponse {
  effectOfOrder: string | null
  fileNumber: string
  filingId: number
  filingType: FilingType
  id: number
  orderDate?: string | null
  orderDetails?: string | null
  files?: CourtOrderDoc[] // FUTURE - not returned from API yet
}

export interface CourtOrderDocPayload {
  fileName: string
  fileKey: string
  documentType: string
}

export interface CourtOrderPayload {
  effectOfOrder: string | null
  fileNumber: string
  filingId: number
  filingType: FilingType
  id: number
  orderDate?: string | null
  orderDetails?: string | null
  files?: CourtOrderDocPayload[]
}
