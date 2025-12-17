// https://moment.github.io/luxon/#/formatting?id=table-of-tokens
import { DateTime } from 'luxon'
import type { DateTimeFormatOptions } from 'luxon'

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

/**
 * Converts a date string to a Date object in the specified timezone (defaults to pacific time).
 */
export const toDate = (
  dateStr: IsoDatePacific | ApiDateTimeUtc,
  timezone = 'America/Vancouver'
): Date | undefined => {
  const newDate = DateTime.fromISO(dateStr, { zone: timezone })
  return newDate.isValid ? newDate.toJSDate() : undefined
}

/**  Return the date as a string in iso date format */
export function toDateStr(date: Date, timezone = 'America/Vancouver'): IsoDatePacific | undefined {
  const newDate = DateTime.fromJSDate(date, { zone: timezone })
  return newDate.isValid ? newDate.toISODate() : undefined
}

/**
 * Return the date as a string in the desired format.
 * Documentation: https://moment.github.io/luxon/#/formatting
 */
export function toFormattedDateStr(
  date: Date,
  format?: DateTimeFormatOptions,
  timezone = 'America/Vancouver'
): IsoDatePacific | undefined {
  const newDate = DateTime.fromJSDate(date, { zone: timezone })
  return newDate.isValid ? newDate.toLocaleString(format) : undefined
}

/**
 * Converts a Date object to a date and time string (Month Day, Year at HH:MM am/pm
 * Pacific time).
 * @example "2021-01-01 07:00:00 GMT" -> "December 31, 2020 at 11:00 pm Pacific time"
 * @example "2021-01-01 08:00:00 GMT" -> "January 1, 2021 at 12:00 pm Pacific time"
 */
export function toPacificDateTime(date: Date): string | undefined {
  const dateStr = toFormattedDateStr(date, { ...DateTime.DATETIME_FULL, timeZoneName: undefined })
  const { t } = useI18n()
  return dateStr
    ? `${dateStr.replace('AM', 'am').replace('PM', 'pm')} ${t('label.pacificTime')}`
    : undefined
}

/**
 * Returns the difference in days between two Date objects.
 */
export function daysBetween(startDate: Date, endDate: Date) {
  const date1 = DateTime.fromJSDate(startDate)
  const date2 = DateTime.fromJSDate(endDate)
  return date1.isValid && date2.isValid ? date2.diff(date1, 'days').toObject().days : undefined
}
