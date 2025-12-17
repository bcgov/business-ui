import type { FormCourtOrderPoa } from '#components'
import { z } from 'zod'

export function getCourtOrderPoaSchema() {
  const t = useNuxtApp().$i18n.t

  return z.object({
    hasPoa: z.boolean().optional(),
    courtOrderNumber: z.union([
      z.literal(''),
      z.string()
        .min(5, t('connect.validation.minChars', { count: 5 }))
        .max(20, t('connect.validation.maxChars', { count: 20 }))
    ]).optional()
  }).superRefine((data, ctx) => {
    if (data.hasPoa === true) {
      if (data.courtOrderNumber === undefined || data.courtOrderNumber === '') {
        ctx.addIssue({
          code: 'custom',
          path: ['courtOrderNumber'],
          message: t('connect.validation.fieldRequired')
        })
      }
    }
  })
}

export type CourtOrderPoaSchema = z.output<ReturnType<typeof getCourtOrderPoaSchema>>

export type FormCourtOrderPoaRef = InstanceType<typeof FormCourtOrderPoa>
