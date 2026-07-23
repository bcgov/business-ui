export function formatResolutionDatesApi(
  dates: TableBusinessState<ResolutionDateSchema>[]
): Resolution[] | undefined {
  const changedDates = dates
    .filter(d => !d.new.actions.includes(ActionType.REMOVED))
    .map((d) => {
      const isNewDate = d.old === undefined

      return {
        id: isNewDate ? undefined : parseInt(d.new.id),
        type: d.new.type,
        date: d.new.date
      }
    })

  return changedDates.length > 0 ? changedDates : undefined
}

export function formatResolutionDatesSection(
  originalDates: Resolution[],
  draftDates?: Resolution[]
): { newState: ResolutionDateSchema, tableState: TableBusinessState<ResolutionDateSchema>[] } {
  const schema = getResolutionDateSchema()
  let newState: ResolutionDateSchema = schema.parse({})

  // if no draft state exists, do not modify the table state
  if (draftDates === undefined) {
    const tableState: TableBusinessState<ResolutionDateSchema>[] = originalDates.map((date) => {
      const parsed = schema.parse(date)
      return {
        old: structuredClone(parsed),
        new: structuredClone(parsed)
      }
    })

    return { newState, tableState }
  }

  const drafts: Resolution[] = []

  draftDates.forEach((d) => {
    if (d.id === undefined) {
      newState = schema.parse({ ...d, actions: [ActionType.ADDED] })
    } else {
      drafts.push(d)
    }
  })

  const tableState: TableBusinessState<ResolutionDateSchema>[] = originalDates.map((date) => {
    const oldParsed = schema.parse(date)
    const matchingDraft = drafts.find(d => d.id === date.id)

    if (matchingDraft) {
      const newParsed = schema.parse(matchingDraft)
      const isChanged = oldParsed.date !== newParsed.date

      return {
        old: oldParsed,
        new: {
          ...newParsed,
          actions: isChanged ? [ActionType.CHANGED] : []
        }
      }
    }

    return {
      old: oldParsed,
      new: {
        ...oldParsed,
        actions: [ActionType.REMOVED]
      }
    }
  })

  return { newState, tableState }
}
