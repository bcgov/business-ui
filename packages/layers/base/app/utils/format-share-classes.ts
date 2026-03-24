export function formatShareClassesUi(
  classes: ShareClass[]
  // config = 'table' // add other format config as necessary
): TableBusinessState<ShareClassSchema>[] {
  const baseFormatter = <T extends { id: number | string, name: string, actions?: ActionType[] }>(item: T) => ({
    ...item,
    id: item.id.toString(),
    actions: item.actions ?? [],
    name: item.name.replace(/\s*\b(shares|share|value)\b/gi, '').trim(),
    isEditing: false
  })

  return classes.map((c) => {
    const formattedSeries = c.series.map(s => ({
      ...baseFormatter(s),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      isInvalid: (s as any).isInvalid ?? false
    }))

    const formattedClass = {
      ...baseFormatter(c),
      currency: c.currency ?? undefined,
      currencyAdditional: c.currencyAdditional ?? undefined,
      series: formattedSeries
    }

    return {
      new: structuredClone(formattedClass),
      old: structuredClone(formattedClass)
    }
  })
}

/**
 * Format share classes from table state back to API payload format.
 *
 * - Appends ' Shares' suffix to class and series names (inverse of formatShareClassesUi)
 * - Normalizes currency to null when undefined
 * - Optionally filters out REMOVED entries when submitting (vs saving as draft)
 *
 * @param shareClasses - The table state share classes to format
 * @param isSubmission - When true, filters out REMOVED classes and series
 */
export function formatShareClassesApi(
  shareClasses: TableBusinessState<ShareClassSchema>[],
  isSubmission: boolean
) {
  return shareClasses
    .filter(c => isSubmission ? !c.new.actions.includes(ActionType.REMOVED) : true)
    .map(c => ({
      ...c.new,
      name: c.new.name + ' Shares',
      currency: c.new.currency ?? null,
      currencyAdditional: c.new.currencyAdditional ?? null,
      series: c.new.series
        .filter(s => isSubmission ? !s.actions.includes(ActionType.REMOVED) : true)
        .map(s => ({
          ...s,
          name: s.name + ' Shares'
        }))
    }))
}
