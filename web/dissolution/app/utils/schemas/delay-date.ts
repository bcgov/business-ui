import { z } from 'zod'
import { DateTime } from 'luxon'

const dateRegex = /^\d{4}-\d{2}-\d{2}$/

export function getDelayDateSchema() {
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
        message: 'This field is required'
      })
      return
    }

    if (!dateRegex.test(val.date)) {
      ctx.addIssue({
        code: 'custom',
        path: ['date'],
        message: 'Date must be in YYYY-MM-DD format.'
      })
      return
    }

    const selectedDate = DateTime.fromISO(val.date, { zone: 'America/Vancouver' })

    if (!selectedDate.isValid) {
      ctx.addIssue({
        code: 'custom',
        path: ['date'],
        message: 'Please enter a valid date.'
      })
      return
    }

    const today = DateTime.fromISO(getToday('America/Vancouver'))

    if (selectedDate <= today) {
      ctx.addIssue({
        code: 'custom',
        path: ['date'],
        message: 'The delay date must be a valid date after today.'
      })
    }
  })
}

export type DelayDateSchema = z.output<ReturnType<typeof getDelayDateSchema>>
