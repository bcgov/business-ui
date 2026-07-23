import { z } from 'zod'
import { DateTime } from 'luxon'
import { CalendarDate } from '@internationalized/date'
import type { FormEffectiveDate } from '#components'

export const DATE_API_INPUT_FORMAT = 'yyyy-MM-dd'
export const DATE_DISPLAY_FORMAT = 'MMMM d, yyyy'
export const DATE_INPUT_FORMATS = [
  'MMMM d, yyyy',
  'MMMM d yyyy',
  'MMM d, yyyy',
  'MMM d yyyy',
  'M/d/yyyy',
  'MM/dd/yyyy',
  'yyyy-MM-dd',
  'd MMMM yyyy',
  'd MMM yyyy'
]

export function getEffectiveDateSchema(minDate?: string) {
  const t = useNuxtApp().$i18n.t

  let effectiveDateField = z.string()
    .min(1, t('validation.fieldRequired'))
    .refine(val => DateTime.fromFormat(val, DATE_DISPLAY_FORMAT).isValid)

  if (minDate) {
    const minDt = DateTime.fromFormat(minDate, DATE_API_INPUT_FORMAT)
    if (minDt.isValid) {
      effectiveDateField = effectiveDateField.refine(
        (val) => {
          const entered = DateTime.fromFormat(val, DATE_DISPLAY_FORMAT)
          if (!entered.isValid) {
            return true
          }
          return entered >= minDt
        },
        t('validation.dateNotBeforeMin', { date: minDt.toFormat(DATE_DISPLAY_FORMAT) })
      )
    }
  }

  return z.object({ effectiveDate: effectiveDateField })
}

export type EffectiveDateSchema = z.output<ReturnType<typeof getEffectiveDateSchema>>
export type FormEffectiveDateRef = InstanceType<typeof FormEffectiveDate>

/** Converts an API-format date string (yyyy-MM-dd) to a CalendarDate, or undefined if invalid. */
export function toCalendarDate(dateStr?: string): CalendarDate | undefined {
  if (!dateStr) {
    return undefined
  }
  const dt = DateTime.fromFormat(dateStr, DATE_API_INPUT_FORMAT)
  if (!dt.isValid) {
    return undefined
  }
  return new CalendarDate(dt.year, dt.month, dt.day)
}
