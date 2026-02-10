import { z } from 'zod'

export function getShareSeriesSchema() {
  return z.object({
    actions: z.array(z.enum(ActionType)).default(() => []),
    name: z.string().default(''),
    priority: z.number().default(1),
    maxNumberOfShares: z.number().nullable().default(null),
    hasMaximumShares: z.boolean().default(false),
    hasRightsOrRestrictions: z.boolean().default(false),
    id: z.string().default(() => crypto.randomUUID())
  })
}

export type ShareSeriesSchema = z.output<ReturnType<typeof getShareSeriesSchema>>

export function getActiveShareSeriesSchema() {
  return getShareSeriesSchema().nullable().optional()
}

export type ActiveShareSeriesSchema = z.output<ReturnType<typeof getActiveShareSeriesSchema>>

export function getShareClassSchema() {
  return z.object({
    actions: z.array(z.enum(ActionType)).default(() => []),
    name: z.string().default(''),
    priority: z.number().default(1),
    maxNumberOfShares: z.number().nullable().default(null),
    parValue: z.number().nullable().default(null),
    currency: z.string().nullable().default(null),
    hasMaximumShares: z.boolean().default(false),
    hasParValue: z.boolean().default(false),
    hasRightsOrRestrictions: z.boolean().default(false),
    series: z.array(getShareSeriesSchema()).optional().default(() => []),
    id: z.string().default(() => crypto.randomUUID())
  })
}

export type ShareClassSchema = z.output<ReturnType<typeof getShareClassSchema>>

export function getActiveShareClassSchema() {
  return getShareClassSchema().nullable().optional()
}

export type ActiveShareClassSchema = z.output<ReturnType<typeof getActiveShareClassSchema>>
