import { z } from 'zod'

export function getAmalgamationCorrectSchema() {
  const t = useNuxtApp().$i18n.t

  return z.object({
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
