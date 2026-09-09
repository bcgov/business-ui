export * from './get-amalgamation-table-columns'

export type BCBusinessTableRow = Omit<AmalgamationCorrectSchema, 'foreignJurisdiction'> & {
  legalType: string
  mailingAddress?: ApiAddress
  foreignJurisdiction?: never
}

export type ExtraBCBusinessTableRow = AmalgamationCorrectSchema & {
  legalType?: never
  mailingAddress?: never
}

export type AmalgamationTableRow = BCBusinessTableRow | ExtraBCBusinessTableRow
