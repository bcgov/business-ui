export function getNameTranslationTableColumns<T extends NameTranslationSchema = NameTranslationSchema>(
  badgeLabelOverrides?: Partial<Record<ActionType, string>>
): TableBusinessColumn<T>[] {
  const thMeta = { class: { th: 'sr-only' } }

  const nameColumn = getNameTranslationNameColumn<T>('first', badgeLabelOverrides, thMeta)
  const actionsColumn = getActionsColumn<T>('last', thMeta)

  return [
    nameColumn,
    actionsColumn
  ]
}
