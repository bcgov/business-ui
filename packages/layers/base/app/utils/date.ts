// https://moment.github.io/luxon/#/formatting?id=table-of-tokens
import { DateTime } from 'luxon'

/**
 * Gets todays date, can customize timezone and output format.
 *
 * @param timezone - An IANA timezone string (e.g., 'America/Vancouver').
 * @param format - A Luxon format string (e.g., 'MMMM dd, yyyy').
 *
 * Defaults to UTC and ISODate (yyyy-mm-dd) format
 *
 * @returns The formatted date string.
 *
 * Timezones https://moment.github.io/luxon/#/zones?id=specifying-a-zone
 *
 * Formatting https://moment.github.io/luxon/#/formatting?id=table-of-tokens
 */
export function getToday(timezone = 'UTC', format?: string): string {
  const dt = DateTime.now().setZone(timezone)

  // dt will return null if an invalid timezone was provided
  if (!dt.isValid) {
    throw new Error(`Invalid timezone: "${timezone}". Reason: ${dt.invalidReason}`)
  }

  if (format) {
    return dt.toFormat(format)
  }

  return dt.toISODate()
}
