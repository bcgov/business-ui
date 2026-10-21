// https://moment.github.io/luxon/#/formatting?id=table-of-tokens
import { DateTime } from 'luxon'
import type { DateTimeFormatOptions } from 'luxon'

/**
 * Gets todays date, can customize timezone and output format.
 *
 * @param timezone - An IANA timezone string or offset (e.g., 'UTC-7').
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
 * Converts an iso date string (YYYY-MM-DD) to an API date-time string in UTC, at midnight in the
 * given timezone (defaults to PCT/UTC-7).
 * @example "2021-07-01" -> "2021-07-01T07:00:00+00:00" // (PCT year-round)
 */
export function toApiDateTime(
  dateStr: IsoDatePacific,
  timezone = 'UTC-7'
): ApiDateTimeUtc | undefined {
  const newDate = DateTime.fromISO(dateStr, { zone: timezone })
  return newDate.isValid ? newDate.toUTC().toFormat('yyyy-MM-dd\'T\'HH:mm:ssZZ') : undefined
}

/**
 * Converts a date string to a Date object in the specified timezone (defaults to pacific time).
 */
export const toDate = (
  dateStr: IsoDatePacific | ApiDateTimeUtc,
  timezone = 'UTC-7'
): Date | undefined => {
  const newDate = DateTime.fromISO(dateStr, { zone: timezone })
  return newDate.isValid ? newDate.toJSDate() : undefined
}

/**  Return the date as a string in iso date format */
export function toDateStr(date: Date, timezone = 'UTC-7'): IsoDatePacific | undefined {
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
  timezone = 'UTC-7'
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
  // useNuxtApp().$i18n works outside setup (e.g. async calls after await), unlike useI18n()
  const t = useNuxtApp().$i18n.t
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

/**
 * Converts an ISO date string (e.g. "2021-02-08") to a human-readable date string.
 * Defaults to DATE_FULL format (e.g. "February 8, 2021").
 *
 * @param dateStr - An ISO date string (YYYY-MM-DD or full ISO 8601).
 * @param format - A Luxon DateTimeFormatOptions object. Defaults to DateTime.DATE_FULL.
 * @param timezone - An IANA timezone string or UTC offset. Defaults to 'UTC-7'.
 * @returns The formatted date string, or the original string if parsing fails.
 *
 * @example toReadableDate('2021-02-08') // "February 8, 2021"
 * @example toReadableDate('2021-02-08', DateTime.DATE_MED) // "Feb 8, 2021"
 */
export function toReadableDate(
  dateStr: string,
  format: DateTimeFormatOptions = DateTime.DATE_FULL,
  timezone = 'UTC-7'
): string {
  const dt = DateTime.fromISO(dateStr, { zone: timezone })
  return dt.isValid ? dt.toLocaleString(format) : dateStr
}
