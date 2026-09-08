export * from './get-amalgamation-table-columns'

export type BCBusinessTableRow = Omit<AmalgamationCorrectSchema, 'jurisdiction'> & {
  legalType: string
  mailingAddress?: ApiAddress
  jurisdiction?: never
}

export type ExtraBCBusinessTableRow = AmalgamationCorrectSchema & {
  legalType?: never
  mailingAddress?: never
}

export type AmalgamationTableRow = BCBusinessTableRow | ExtraBCBusinessTableRow