import { getResolutionDateColumn } from './get-resolution-date-column'

export function getResolutionDatesTableColumns<T extends ResolutionDateSchema = ResolutionDateSchema>(
  badgeLabelOverrides?: Partial<Record<ActionType, string>>
): TableBusinessColumn<T>[] {
  const dateMeta = { class: { th: 'sr-only', td: 'pl-0 pr-2 py-4' } }
  const actionsMeta = { class: { th: 'sr-only', td: 'pl-2 py-4 pr-0' } }

  const dateColumn = getResolutionDateColumn<T>('first', badgeLabelOverrides, dateMeta)
  const actionsColumn = getActionsColumn<T>('last', actionsMeta)

  return [
    dateColumn,
    actionsColumn
  ]
}
