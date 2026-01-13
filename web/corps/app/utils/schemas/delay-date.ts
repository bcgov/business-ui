import { z } from 'zod'
import { DateTime } from 'luxon'

const dateRegex = /^\d{4}-\d{2}-\d{2}$/

export function getDelayDateSchema() {
  const t = useNuxtApp().$i18n.t

  return z.object({
    option: z.enum(DelayOption).default(DelayOption.SIX_MONTHS),
    date: z.string().optional().default('')
  }).superRefine((val, ctx) => {
    if (val.option !== DelayOption.CUSTOM) {
      return
    }

    if (!val.date) {
      ctx.addIssue({
        code: 'custom',
        path: ['date'],
        message: t('connect.validation.fieldRequired')
      })
      return
    }

    if (!dateRegex.test(val.date)) {
      ctx.addIssue({
        code: 'custom',
        path: ['date'],
        message: t('validation.date.invalidFormat')
      })
      return
    }

    const selectedDate = DateTime.fromISO(val.date, { zone: 'America/Vancouver' })

    if (!selectedDate.isValid) {
      ctx.addIssue({
        code: 'custom',
        path: ['date'],
        message: t('validation.date.invalid')
      })
      return
    }

    const today = DateTime.fromISO(getToday('America/Vancouver'), { zone: 'America/Vancouver' })

    if (selectedDate <= today) {
      ctx.addIssue({
        code: 'custom',
        path: ['date'],
        message: t('validation.date.tooSmall')
      })
    }
  })
}

export type DelayDateSchema = z.output<ReturnType<typeof getDelayDateSchema>>
