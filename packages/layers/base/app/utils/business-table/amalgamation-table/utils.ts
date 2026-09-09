export function isBCBusiness(
  business: AmalgamationTableRow
): business is BCBusinessTableRow {
  // if jurisdiction exists, it's EX BC
  return !business.jurisdiction?.country
}
