export function formatShareClassesUi(
  classes: ShareClass[]
  // config = 'table' // add other format config as necessary
): TableBusinessState<ShareClassSchema>[] {
  const baseFormatter = <T extends { id: number | string, name: string }>(item: T) => ({
    ...item,
    id: item.id.toString(),
    actions: [],
    name: item.name.replace(/\s*\b(shares|share|value)\b/gi, '').trim()
  })

  return classes.map((c) => {
    const formattedSeries = c.series.map(s => ({
      ...baseFormatter(s),
      isInvalid: false
    }))

    const formattedClass = {
      ...baseFormatter(c),
      currency: c.currency ?? undefined,
      series: formattedSeries
    }

    return {
      new: structuredClone(formattedClass),
      old: structuredClone(formattedClass)
    }
  })
}
