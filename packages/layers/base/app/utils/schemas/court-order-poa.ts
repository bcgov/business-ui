// https://github.com/bcgov/business-schemas/blob/main/src/registry_schemas/schemas/court_order.json
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

// filingId and filingType
export function getCourtOrderPoaFullSchema() {
  const t = useNuxtApp().$i18n.t
  return z.object({
    isEditing: z.boolean().default(false),
    actions: z.array(z.enum(ActionType)).default(() => []),
    id: z.preprocess( // convert DB `id` int to string for UI diff'ing
      val => (typeof val === 'number' ? String(val) : val),
      z.string().default(() => crypto.randomUUID())
    ),
    fileNumber: z.string()
      .min(5, t('connect.validation.minChars', { count: 5 }))
      .max(20, t('connect.validation.maxChars', { count: 20 }))
      .default(''),
    effectOfOrder: z.preprocess( // convert DB value into boolean for UI usage
      val => val === 'planOfArrangement',
      z.boolean()
    ),
    orderDetails: z.string().nullable(),
    filingId: z.number(),
    filingType: z.enum(FilingType),
    orderDate: z.string().nullable(),
    files: z.array(z.unknown()).optional() // FUTURE - not returned by API yet
  })
}

export type CourtOrderPoaFullSchema = z.output<ReturnType<typeof getCourtOrderPoaFullSchema>>

export function getActiveCourtOrderPoaFullSchema() {
  return getCourtOrderPoaFullSchema().nullable().optional()
}

export type ActiveCourtOrderPoaFullSchema = z.output<ReturnType<typeof getActiveCourtOrderPoaFullSchema>>
