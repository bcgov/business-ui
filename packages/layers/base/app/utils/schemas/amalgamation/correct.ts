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
    name: z.string()
      .trim()
      .min(1, t('connect.validation.fieldRequired'))
      .min(3, t('connect.validation.minChars', { count: 3 }))
      .default(''),
    number: z.string()
      .trim()
      .min(1, t('connect.validation.fieldRequired'))
      .min(3, t('connect.validation.minChars', { count: 3 }))
      .regex(/^[a-zA-Z0-9-]+$/, t('validation.corpNumFormat'))
      .default(''),
    jurisdiction: z.object({
      country: z.string()
        .trim()
        .min(1, t('connect.validation.fieldRequired')),
      region: z.string().nullable()
    }).default(() => ({ country: '', region: null }))
  })
}

export function getActiveAmalgamationCorrectSchema() {
  return getAmalgamationCorrectSchema().nullable().optional()
}

export type AmalgamationCorrectSchema = z.output<ReturnType<typeof getAmalgamationCorrectSchema>>
export type ActiveAmalgamationCorrectSchema = z.output<ReturnType<typeof getActiveAmalgamationCorrectSchema>>

export function getAmalgamationCorrectStatementSchema() {
  return z.object({
    courtApproval: z.boolean().default(false)
  })
}

export function getActiveAmalgamationCorrectStatementSchema() {
  return getAmalgamationCorrectSchema().nullable().optional()
}

export type AmalgamationCorrectStatementSchema = z.output<ReturnType<typeof getAmalgamationCorrectStatementSchema>>
export type ActiveAmalgamationCorrectStatementSchema = z.output<
  ReturnType<typeof getActiveAmalgamationCorrectStatementSchema>
>
