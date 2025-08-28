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

/**
 * Generates a string representing the current date in ISO 8601 format (YYYY-MM-DD).
 *
 * The date is formatted using the 'en-CA' locale, ensuring compliance with the ISO 8601 standard.
 *
 * @returns {string} A string representing the current date in the YYYY-MM-DD format.
 */
export const nowAsIsoDate = () => {
  return new Intl.DateTimeFormat('en-CA').format(new Date())
}

export const isDateBetween = (
  dateToCheck: string | Date,
  startDate: string | Date | undefined = undefined,
  endDate: string | Date | undefined = undefined,
  inclusive: boolean = true
): boolean => {
  if (!startDate) {
    startDate = new Date(0)
  }
  if (!endDate) {
    endDate = new Date('3000-01-01')
  }
  const date = new Date(dateToCheck)
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (inclusive) {
    return date >= start && date <= end
  } else {
    return date > start && date < end
  }
}
