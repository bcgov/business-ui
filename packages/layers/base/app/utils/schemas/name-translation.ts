import { z } from 'zod'

export function getNameTranslationSchema() {
  const t = useNuxtApp().$i18n.t
  const nameTranslationPattern = /^[A-Za-zÀ-ÿ_@./#'’&+-]+(?: [A-Za-zÀ-ÿ_@./#'’&+-]+)*$/

  return z.object({
    isEditing: z.boolean().default(false),
    id: z.string().default(() => crypto.randomUUID()),
    actions: z.array(z.enum(ActionType)).default(() => []),
    name: z.string()
      .min(1, t('connect.validation.fieldRequired'))
      .regex(nameTranslationPattern, t('validation.invalidCharacters'))
      .max(50, t('connect.validation.maxChars', { count: 50 }))
      .default('')
  })
}

export type NameTranslationSchema = z.output<ReturnType<typeof getNameTranslationSchema>>

export function getActiveNameTranslationSchema() {
  return getNameTranslationSchema().nullable().optional()
}

export type ActiveNameTranslationSchema = z.output<ReturnType<typeof getActiveNameTranslationSchema>>
