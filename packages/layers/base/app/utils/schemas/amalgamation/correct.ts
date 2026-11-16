// https://github.com/bcgov/business-schemas/blob/main/src/registry_schemas/schemas/correction_amalgamation.json
import { z } from 'zod'

export function getAmalgamationCorrectSchema() {
  const t = useNuxtApp().$i18n.t

  return z.object({
    isEditing: z.boolean()
      .default(false),
    actions: z.array(z.enum(ActionType))
      .default(() => []),
    id: z.preprocess( // convert DB `id` int to string for UI diff'ing
      val => (typeof val === 'number' ? String(val) : val),
      z.string()
        .default(() => crypto.randomUUID())
    ),
    legalName: z.string()
      .trim()
      .min(1, t('connect.validation.fieldRequired'))
      .min(3, t('connect.validation.minChars', { count: 3 }))
      .default(''),
    identifier: z.string()
      .trim()
      .min(1, t('connect.validation.fieldRequired'))
      .min(3, t('connect.validation.minChars', { count: 3 }))
      .max(40, t('connect.validation.maxChars', { count: 40 }))
      .regex(/^[a-zA-Z0-9-]+$/, t('validation.corpNumFormat'))
      .default(''),
    foreignJurisdiction: z.object({
      country: z.string()
        .trim()
        .min(1, t('connect.validation.fieldRequired')),
      region: z.string().nullable()
    }).default(() => ({ country: '', region: null })),
    role: z.string()
      .default('amalgamating')
  })
}

export type AmalgamationCorrectSchema = z.output<ReturnType<typeof getAmalgamationCorrectSchema>>

export function getAmalgamationCorrectStatementSchema() {
  return z.object({
    isEditing: z.boolean()
      .default(false),
    actions: z.array(z.enum(ActionType))
      .default(() => []),
    courtApproval: z.boolean().default(false)
  })
}

export type AmalgamationCorrectStatementSchema = z.output<ReturnType<typeof getAmalgamationCorrectStatementSchema>>

export function getActiveAmalgamationSchema() {
  return z.discriminatedUnion('key', [
    z.object({
      key: z.literal('business'),
      value: getAmalgamationCorrectSchema()
    }),
    z.object({
      key: z.literal('statement'),
      value: getAmalgamationCorrectStatementSchema()
    })
  ]).optional()
}

export type ActiveAmalgamationSchema = z.infer<ReturnType<typeof getActiveAmalgamationSchema>>
