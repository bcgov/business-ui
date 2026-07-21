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
    'd MMM yyyy',
  ]

export function getEffectiveDateSchema() {
  const t = useNuxtApp().$i18n.t

  return z.object({
    effectiveDate: z.string()
      .min(1, t('validation.fieldRequired'))
      .refine(
        (val) => DateTime.fromFormat(val, DATE_DISPLAY_FORMAT).isValid,
        t('validation.invalidDate')
      )
  })
}

export type EffectiveDateSchema = z.output<ReturnType<typeof getEffectiveDateSchema>>
export type FormEffectiveDateRef = InstanceType<typeof FormEffectiveDate>
