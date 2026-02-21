export function formatShareClassesUi(
  classes: ShareClass[]
  // config = 'table' // add other format config as necessary
): TableBusinessState<ShareClassSchema>[] {
  const baseFormatter = <T extends { id: number | string, name: string, actions?: ActionType[] }>(item: T) => ({
    ...item,
    id: item.id.toString(),
    actions: item.actions ?? [],
    name: item.name.replace(/\s*\b(shares|share|value)\b/gi, '').trim()
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
      series: formattedSeries
    }

    return {
      new: structuredClone(formattedClass),
      old: structuredClone(formattedClass)
    }
  })
}
