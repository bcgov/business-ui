/**
 * Standalone court order filing payload.
 * See: https://github.com/bcgov/business-schemas/blob/main/src/registry_schemas/schemas/court_order.json
 *
 * NB: documents are always submitted in the `files` array (legal-api makes the legacy flat
 * `fileKey` property mutually exclusive with `files`) and only one `court_order` document is
 * allowed per filing. `effectOfOrder` only ever holds the literal 'planOfArrangement'.
 */
export interface CourtOrderFilingPayload extends FilingPayloadData {
  fileNumber: string
  effectOfOrder?: string
  orderDetails?: string
  files?: CourtOrderDocPayload[]
}

export interface CourtOrderFiling {
  courtOrder: CourtOrderFilingPayload
}

/**
 * The court order draft filing loaded on page init.
 * NB: the draft is always pre-created before the page is opened (its filing id is a required
 * route param), so this is never an "unsaved/new filing" state.
 */
export type CourtOrderDraftState = FilingGetByIdResponse<CourtOrderFiling>
