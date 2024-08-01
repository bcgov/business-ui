import { NrRequestTypeCodes } from '@bcrs-shared-components/enums'

/** use NR request type code to get NR type from enum */
export function mapRequestTypeCdToNrType (requestTypeCd: NrRequestTypeCodes): string {
  return NrRequestTypeStrings[requestTypeCd] as string
}
