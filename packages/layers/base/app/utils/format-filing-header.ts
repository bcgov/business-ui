/**
 * The payment fragment of a filing header: the staff payment for staff, the folio number
 * for a client account.
 */
export function formatPaymentHeaderApi(
  formState: { staffPayment?: StaffPaymentSchema, folio?: FolioSchema },
  isStaff: boolean
): Partial<FilingHeaderSubmission> {
  return isStaff
    ? formatStaffPaymentApi(formState.staffPayment!)
    : { folioNumber: formState.folio?.folioNumber }
}

/** The filing body fragments every filing shares - the court order and its document. */
export function formatCommonFilingDataApi(
  courtOrder?: CourtOrderPoaSchema,
  documentId?: string
): FilingPayloadData {
  return {
    ...(courtOrder?.courtOrderNumber ? { courtOrder: formatCourtOrderApi(courtOrder) } : {}),
    ...(documentId ? { documentId } : {})
  }
}

/**
 * Applies the authorization certify convention to the filing header.
 *
 * For these filings the api derives the certifier from the JWT and rejects a provided
 * `certifiedBy`, so it is always removed. `authorizationReceived` is only recorded on
 * submission - a draft carries neither.
 */
export function applyAuthorizationCertify(header: Record<string, unknown>, isSubmission: boolean) {
  delete header.certifiedBy
  if (!isSubmission) {
    delete header.authorizationReceived
  }
}
