export const fromIsoToUsDateFormat = (isoDate: string | undefined) => {
  if (!isoDate) {
    return undefined
  }
  const date = new Date(isoDate)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}
