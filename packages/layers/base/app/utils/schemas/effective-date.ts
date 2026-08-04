import { z } from 'zod'
import { DateTime } from 'luxon'
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

export function getEffectiveDateSchema(
  minDate?: string,
  maxDate?: string,
  required = true
) {
  const t = useNuxtApp().$i18n.t

  function addBoundaryRefinement(
    schema: z.ZodString,
    boundaryDate: string,
    compare: (entered: DateTime, boundary: DateTime) => boolean,
    message: string
  ) {
    const boundary = DateTime.fromFormat(
      boundaryDate,
      DATE_API_INPUT_FORMAT
    )

    if (!boundary.isValid) {
      return schema
    }

    return schema.refine(
      (val) => {
        const entered = parseInputDate(val)

        // Invalid formats are handled by the format refinement.
        return !entered || compare(entered, boundary)
      },
      message
    )
  }

  const base = required
    ? z.string().min(1, t('validation.fieldRequired'))
    : z.string()

  let dateField = base.refine(
    val => !val || !!parseInputDate(val),
    t('text.effectiveDateFormat')
  )

  if (minDate && maxDate) {
    const minBoundary = DateTime.fromFormat(
      minDate,
      DATE_API_INPUT_FORMAT
    )

    const maxBoundary = DateTime.fromFormat(
      maxDate,
      DATE_API_INPUT_FORMAT
    )

    if (minBoundary.isValid && maxBoundary.isValid) {
      const rangeMsg = t('validation.dateNotInRange', {
        minDate: minBoundary.toFormat(DATE_DISPLAY_FORMAT),
        maxDate: maxBoundary.toFormat(DATE_DISPLAY_FORMAT)
      })

      dateField = dateField.refine(
        (val) => {
          const entered = parseInputDate(val)

          // Invalid formats are handled by the format refinement.
          return !entered
            || (
              entered >= minBoundary
              && entered <= maxBoundary
            )
        },
        rangeMsg
      )
    }
  } else if (minDate) {
    const minBoundary = DateTime.fromFormat(
      minDate,
      DATE_API_INPUT_FORMAT
    )

    const minMsg = minBoundary.isValid
      ? t('validation.dateNotBeforeMin', {
        date: minBoundary.toFormat(DATE_DISPLAY_FORMAT)
      })
      : ''

    dateField = addBoundaryRefinement(
      dateField,
      minDate,
      (entered, boundary) => entered >= boundary,
      minMsg
    )
  } else if (maxDate) {
    const maxBoundary = DateTime.fromFormat(
      maxDate,
      DATE_API_INPUT_FORMAT
    )

    const maxMsg = maxBoundary.isValid
      ? t('validation.dateNotAfterMax', {
        date: maxBoundary.toFormat(DATE_DISPLAY_FORMAT)
      })
      : ''

    dateField = addBoundaryRefinement(
      dateField,
      maxDate,
      (entered, boundary) => entered <= boundary,
      maxMsg
    )
  }

  return z.object({
    dateInput: dateField
  })
}

export type EffectiveDateSchema = z.output<ReturnType<typeof getEffectiveDateSchema>>
export type FormEffectiveDateRef = InstanceType<typeof FormEffectiveDate>

/**
 * Parses a user-entered date using any supported input format.
 */
export function parseInputDate(
  dateStr?: string
): DateTime | undefined {
  if (!dateStr) {
    return undefined
  }

  for (const format of DATE_INPUT_FORMATS) {
    const parsed = DateTime.fromFormat(
      dateStr.trim(),
      format
    )

    if (parsed.isValid) {
      return parsed
    }
  }

  return undefined
}
