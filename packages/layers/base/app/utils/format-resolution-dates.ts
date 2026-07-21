export function formatResolutionDatesUi(dates: Resolution[]): Array<{
  old: ResolutionDateSchema
  new: ResolutionDateSchema
}> {
  const schema = getResolutionDateSchema()
  return dates.map((d) => {
    const data = schema.parse(d)
    return { old: structuredClone(data), new: structuredClone(data) }
  })
}
