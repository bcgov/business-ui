// temp formatter only, changes tbd in correction implementation ticket
import { merge } from 'es-toolkit'

export function formatAmalCorrectUi(
  data: Amalgamation
): {
  tableState: TableBusinessState<AmalgamationTableRow>[]
  statementState: TableBusinessState<AmalgamationCorrectStatementSchema>
} {
  const schema = getAmalgamationCorrectSchema()
  const tableState = data.amalgamatingBusinesses.map((d) => {
    const cloned = structuredClone(d)
    const parsed = schema.parse(cloned)
    const merged = merge(cloned, parsed)

    if ('legalType' in merged || 'mailingAddress' in merged) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (merged as any).foreignJurisdiction
    }

    return {
      old: structuredClone(merged),
      new: structuredClone(merged)
    }
  })

  const stmntSchema = getAmalgamationCorrectStatementSchema()
  const parsedStatement = stmntSchema.parse(data)
  const statementState = {
    new: structuredClone(parsedStatement),
    old: structuredClone(parsedStatement)
  }
  return {
    tableState,
    statementState
  }
}
