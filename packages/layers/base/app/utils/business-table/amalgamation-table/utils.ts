export function isBCBusiness(
  business: AmalgamationTableRow
): business is BCBusinessTableRow {
  // if jurisdiction exists, it's EX BC
  return !Boolean(business.jurisdiction?.country)
}