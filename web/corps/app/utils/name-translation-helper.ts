export function createNameTranslationSchema(nameTranslation: Partial<NameTranslation>): NameTranslationSchema {
  return {
    id: nameTranslation.id ?? crypto.randomUUID(),
    name: nameTranslation.name ?? '',
    isEditing: false,
    actions: []
  }
}

export function mapOriginalNameTranslations(
  nameTranslations: NameTranslation[]
): TableBusinessState<NameTranslationSchema>[] {
  return nameTranslations.map((nameTranslation) => {
    const base = createNameTranslationSchema(nameTranslation)
    return { new: { ...base }, old: { ...base } }
  })
}

export function mapDraftOnlyNameTranslations(
  nameTranslations: CorrectionPayload['nameTranslations']
): TableBusinessState<NameTranslationSchema>[] {
  return (nameTranslations ?? []).map(nameTranslation => ({
    old: undefined,
    new: {
      ...createNameTranslationSchema(nameTranslation),
      actions: [ActionType.ADDED]
    }
  }))
}

export function mergeDraftNameTranslations(
  originalTableState: TableBusinessState<NameTranslationSchema>[],
  draftNameTranslations: CorrectionPayload['nameTranslations']
): TableBusinessState<NameTranslationSchema>[] {
  const draftEntries = draftNameTranslations ?? []
  const merged: TableBusinessState<NameTranslationSchema>[] = []

  for (const originalEntry of originalTableState) {
    const draftEntry = draftEntries.find(entry => entry.id === originalEntry.new.id)

    if (!draftEntry) {
      merged.push(originalEntry)
      continue
    }

    const action = draftEntry.action
      ? (Object.values(ActionType).includes(draftEntry.action as ActionType)
        ? draftEntry.action as ActionType
        : ActionType.CORRECTED)
      : undefined

    merged.push({
      old: originalEntry.old,
      new: {
        ...originalEntry.new,
        name: draftEntry.name,
        actions: action ? [action] : []
      }
    })
  }

  for (const draftEntry of draftEntries) {
    if (!originalTableState.some(entry => entry.new.id === draftEntry.id)) {
      merged.push({
        old: undefined,
        new: {
          ...createNameTranslationSchema(draftEntry),
          actions: [ActionType.ADDED]
        }
      })
    }
  }

  return merged
}