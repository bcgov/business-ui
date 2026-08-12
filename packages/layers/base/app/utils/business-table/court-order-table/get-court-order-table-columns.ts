import { getAssociatedFilingColumn } from "./get-associated-filing-column"
import { getCourtOrderNumberColumn } from "./get-court-order-number-column"
import { getCourtOrderTextColumn } from "./get-court-order-text-column"
import { getHasPoaColumn } from "./get-has-poa-column"

export function getCourtOrderTableColumns<T extends CourtOrderPoaFullSchema = CourtOrderPoaFullSchema>(
  badgeLabelOverrides?: Partial<Record<ActionType, string>>
): TableBusinessColumn<T>[] {
  const numberColumn = getCourtOrderNumberColumn<T>('first', badgeLabelOverrides)
  const textColumn = getCourtOrderTextColumn<T>()
  const hasPoaColumn = getHasPoaColumn<T>()
  const associatedFilingColumn = getAssociatedFilingColumn<T>()
  const actionsColumn = getActionsColumn<T>()

  return [
    numberColumn,
    textColumn,
    hasPoaColumn,
    associatedFilingColumn,
    actionsColumn
  ]
}
