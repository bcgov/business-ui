import { cloneDeep } from 'es-toolkit'

const NON_EDITABLE_FIELDS = [
  'isEditing',
  'actions',
  'isInvalid',
  'id',
  'priority', // priority not considered an edit
  'series' // editing a share series is not considered an edit to the share class
] as const

// helper to format single class or series into ShareClassSchema
function formatItem<T extends { id?: number | string | null, name: string, actions?: ActionType[] }>(item: T) {
  const name = item.name.replace(/\s*\b(shares|share|value)\b/gi, '').trim()
  const id = (item.id !== null && item.id !== undefined) ? item.id.toString() : crypto.randomUUID()

  return {
    ...item,
    id,
    name,
    actions: item.actions ?? [],
    isEditing: false
  }
}

// format a single share class including its series
function formatShareClassItem(c: ShareClass): ShareClassSchema {
  const formattedSeries = (c.series || []).map(s => ({
    ...formatItem(s),
    isInvalid: false
  }))

  return {
    ...formatItem(c),
    currency: c.currency ?? undefined,
    currencyAdditional: c.currencyAdditional ?? undefined,
    series: formattedSeries
  }
}

// format series changes inside a share class
function formatSeries(
  originalSeries: ShareSeriesSchema[],
  draftSeries: ShareSeriesSchema[]
): ShareSeriesSchema[] {
  const activeSeries: ShareSeriesSchema[] = []
  const removedSeries: ShareSeriesSchema[] = []

  // compare original series against drafts
  for (const item of originalSeries) {
    const draftMatch = draftSeries.find(s => s.id === item.id)

    // original missing in draft -> item was removed
    if (!draftMatch) {
      removedSeries.push({
        ...cloneDeep(item),
        actions: [ActionType.REMOVED]
      })
    } else {
      // exists in original and draft -> check if edited
      const isChanged = !isEqualOmit(item, draftMatch, NON_EDITABLE_FIELDS)
      activeSeries.push({
        ...cloneDeep(draftMatch),
        actions: isChanged ? [ActionType.CHANGED] : []
      })
    }
  }

  // any series id not in the original has been newly added
  for (const newSeries of draftSeries) {
    const isOriginal = originalSeries.some(s => s.id === newSeries.id)

    if (!isOriginal) {
      activeSeries.push({
        ...cloneDeep(newSeries),
        actions: [ActionType.ADDED]
      })
    }
  }

  activeSeries.sort((a, b) => (a.priority) - (b.priority))
  removedSeries.sort((a, b) => (a.priority) - (b.priority))

  const mergedSeries = [...activeSeries]

  // insert removed items into historical position
  for (const removedItem of removedSeries) {
    const targetIndex = Math.max(0, (removedItem.priority ?? 1) - 1)
    const insertIndex = Math.min(targetIndex, mergedSeries.length)
    mergedSeries.splice(insertIndex, 0, removedItem)
  }

  // rewrite priority to match new sorted and merged list
  return mergedSeries.map((item, i) => ({
    ...item,
    priority: i + 1
  }))
}

export function formatShareClassesSection(
  originalClasses?: ShareClass[],
  draftClasses?: ShareClass[]
): TableBusinessState<ShareClassSchema>[] {
  const originals = (originalClasses || []).map(formatShareClassItem)

  if (draftClasses === undefined) {
    return originals.map(item => ({
      old: item,
      new: cloneDeep(item)
    }))
  }

  const drafts = (draftClasses || []).map(formatShareClassItem)

  const activeClasses: TableBusinessState<ShareClassSchema>[] = []
  const removedClasses: TableBusinessState<ShareClassSchema>[] = []

  // compare original classes against draft
  for (const oldClass of originals) {
    const draftMatch = drafts.find(c => c.id === oldClass.id)

    // original missing in draft -> item was removed
    if (!draftMatch) {
      removedClasses.push({
        old: oldClass,
        new: {
          ...cloneDeep(oldClass),
          actions: [ActionType.REMOVED]
        }
      })
    } else {
      // else item exists in original and draft -> check if edited
      const series = formatSeries(oldClass.series, draftMatch.series)

      const newClass = {
        ...cloneDeep(draftMatch),
        series
      }

      const isChanged = !isEqualOmit(
        { ...oldClass, series: [] },
        { ...draftMatch, series: [] },
        NON_EDITABLE_FIELDS
      )

      activeClasses.push({
        old: oldClass,
        new: {
          ...newClass,
          actions: isChanged ? [ActionType.CHANGED] : []
        }
      })
    }
  }

  // any class id not in the original has been newly added
  for (const newClass of drafts) {
    const isOriginal = originals.some(old => old.id === newClass.id)

    if (!isOriginal) {
      const series = newClass.series.map(s => ({
        ...s,
        actions: [ActionType.ADDED]
      }))

      activeClasses.push({
        old: undefined,
        new: {
          ...newClass,
          series,
          actions: [ActionType.ADDED]
        }
      })
    }
  }

  activeClasses.sort((a, b) => (a.new.priority) - (b.new.priority))
  removedClasses.sort((a, b) => (a.new.priority) - (b.new.priority))

  const mergedClasses = [...activeClasses]

  // insert removed items into historical position
  for (const removedRow of removedClasses) {
    const targetIndex = Math.max(0, (removedRow.new.priority ?? 1) - 1)
    const insertIndex = Math.min(targetIndex, mergedClasses.length)
    mergedClasses.splice(insertIndex, 0, removedRow)
  }

  // rewrite priority to match new sorted and merged list
  return mergedClasses.map((row, i) => ({
    ...row,
    new: {
      ...row.new,
      priority: i + 1
    }
  }))
}

/**
 * Format share classes from table state back to API payload format.
 *
 * - Appends ' Shares' suffix to class and series names (inverse of formatShareClassesUi)
 * - Normalizes currency to null when undefined
 *
 * @param shareClasses - The table state share classes to format
 */
export function formatShareClassesApi(
  shareClasses: TableBusinessState<ShareClassSchema>[]
): ShareClass[] {
  return shareClasses
    .filter(c => !c.new.actions.includes(ActionType.REMOVED))
    .map(c => ({
      id: !c.new.actions.includes(ActionType.ADDED) ? Number(c.new.id) : undefined,
      name: c.new.name + ' Shares',
      priority: c.new.priority,
      hasMaximumShares: c.new.hasMaximumShares,
      maxNumberOfShares: c.new.maxNumberOfShares,
      hasRightsOrRestrictions: c.new.hasRightsOrRestrictions,
      hasParValue: c.new.hasParValue,
      parValue: c.new.parValue,
      currency: c.new.currency ?? null,
      currencyAdditional: c.new.currencyAdditional ?? null,
      series: c.new.series
        .filter(s => !s.actions.includes(ActionType.REMOVED))
        .map(s => ({
          id: !s.actions.includes(ActionType.ADDED) ? Number(s.id) : undefined,
          name: s.name + ' Shares',
          priority: s.priority,
          hasMaximumShares: s.hasMaximumShares,
          maxNumberOfShares: s.maxNumberOfShares,
          hasRightsOrRestrictions: s.hasRightsOrRestrictions
        }))
    }))
}
