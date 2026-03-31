export function getNameTranslationTableColumns<T extends NameTranslationSchema = NameTranslationSchema>(
  badgeLabelOverrides?: Partial<Record<ActionType, string>>
): TableBusinessColumn<T>[] {
  const nameColumn = getNameTranslationNameColumn<T>('first', badgeLabelOverrides)
  const actionsColumn = getActionsColumn<T>()

  return [
    nameColumn,
    actionsColumn
  ]
}
