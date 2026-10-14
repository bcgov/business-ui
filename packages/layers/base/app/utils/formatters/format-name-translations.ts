const NON_EDITABLE_FIELDS = [
  'isEditing',
  'actions',
  'id'
] as const

function createDefaultNameTranslation(nt?: NameTranslation): NameTranslationSchema {
  return {
    id: nt?.id ?? crypto.randomUUID(),
    name: nt?.name ?? '',
    actions: [],
    isEditing: false
  }
}

export function formatNameTranslationsSection(
  originalTranslations?: NameTranslation[],
  draftTranslations?: NameTranslation[]
): TableBusinessState<NameTranslationSchema>[] {
  const originals = originalTranslations ?? []

  function processItem(item?: NameTranslation): NameTranslationSchema {
    if (!item) {
      return createDefaultNameTranslation()
    }
    return createDefaultNameTranslation(item)
  }

  // return original items if no draft
  if (draftTranslations === undefined) {
    return originals.map((item) => {
      const formatted = processItem(item)
      return {
        old: formatted,
        new: cloneDeep(formatted)
      }
    })
  }

  // format originals and merge draft changes
  const formattedOriginals: TableBusinessState<NameTranslationSchema>[] = originals.map((oldNt) => {
    const oldItem = processItem(oldNt)
    const draftItem = draftTranslations?.find(d => (oldNt.id && d.id === oldNt.id))

    // Item exists in draft -> Check if edited or unchanged
    if (draftItem) {
      const newItem = processItem(draftItem)
      const isChanged = !isEqualOmit(oldItem, newItem, NON_EDITABLE_FIELDS)

      return {
        old: oldItem,
        new: {
          ...newItem,
          actions: isChanged ? [ActionType.CHANGED] : []
        }
      }
    }

    // Item exists in original but not in draft -> Mark as DELETED
    return {
      old: oldItem,
      new: {
        ...cloneDeep(oldItem),
        actions: [ActionType.REMOVED]
      }
    }
  })

  // Item exists in draft but not originals -> mark as ADDED
  const addedDrafts = draftTranslations.filter(d => !originals.some(o => (o.id && o.id === d.id)))

  const formattedAddedDrafts: TableBusinessState<NameTranslationSchema>[] = addedDrafts.map((draftItem) => {
    const item = processItem(draftItem)
    return {
      old: undefined,
      new: {
        ...item,
        actions: [ActionType.ADDED]
      }
    }
  })

  return [...formattedAddedDrafts, ...formattedOriginals]
}

// existing items are updated by matching id
// any items submitted without an id will be newly created
// any existing items excluded will be deleted
// NB: must include unchanged items or they will be deleted
// eslint-disable-next-line max-len
// https://github.com/bcgov/lear/blob/main/queue_services/business-filer/src/business_filer/filing_processors/filing_components/aliases.py#L40
export function formatNameTranslationsApi(
  nameTranslations: TableBusinessState<NameTranslationSchema>[]
): NameTranslation[] | undefined {
  // return undefined if no changes have been made
  const hasChanges = nameTranslations.some(item => item.new.actions.length > 0)
  if (!hasChanges) {
    return undefined
  }

  return nameTranslations
    .filter(item => !item.new.actions.includes(ActionType.REMOVED))
    .map((item) => {
      const { id, name } = item.new
      const isExisting = Boolean(item.old)

      return {
        id: isExisting ? id : undefined,
        name
      }
    })
}
