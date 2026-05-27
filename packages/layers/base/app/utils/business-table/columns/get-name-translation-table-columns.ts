export function getNameTranslationTableColumns<T extends NameTranslationSchema = NameTranslationSchema>(
  badgeLabelOverrides?: Partial<Record<ActionType, string>>
): TableBusinessColumn<T>[] {
  const nameMeta = { class: { th: 'sr-only', td: 'pl-0 pr-2 py-4' } }
  const actionsMeta = { class: { th: 'sr-only', td: 'pl-2 py-4 pr-0' } }

  const nameColumn = getNameTranslationNameColumn<T>('first', badgeLabelOverrides, nameMeta)
  const actionsColumn = getActionsColumn<T>('last', actionsMeta)

  return [
    nameColumn,
    actionsColumn
  ]
}
