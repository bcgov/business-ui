import { NrRequestActionCodes } from '@bcrs-shared-components/enums'

/** use NR request action code to get NR type from enum */
export function mapRequestActionCdToNrType (requestActionCd: NrRequestActionCodes): string {
  // Can add other NrRequestActionCodes here to use the action code instead of the NrRequestTypeCd.
  // Must ensure that the action code does not have several potential types
  // Example: the NEW action code can be for Incorporation or Registration, so we cannot use it for the NR type
  if (requestActionCd === NrRequestActionCodes.AMALGAMATE) { return 'Amalgamation' }
  return ''
}
