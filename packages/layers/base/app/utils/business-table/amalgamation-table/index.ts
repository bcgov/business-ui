export * from './get-amalgamation-table-columns'

export type BCBusinessTableRow = Omit<AmalgamationCorrectSchema, 'foreignJurisdiction'> & {
  legalType: string
  mailingAddress?: ApiAddress
  foreignJurisdiction?: never
}

export type ExBCBusinessTableRow = AmalgamationCorrectSchema & {
  legalType?: never
  mailingAddress?: never
}

export type AmalgamationTableRow = BCBusinessTableRow | ExBCBusinessTableRow
