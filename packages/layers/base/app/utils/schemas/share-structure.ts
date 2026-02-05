import { z } from 'zod'

export function getShareSeriesSchema() {
  return z.object({
    name: z.string(),
    priority: z.number(),
    maxNumberOfShares: z.number().nullable(),
    hasMaximumShares: z.boolean(),
    hasRightsOrRestrictions: z.boolean(),
    uuid: z.string()
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
    name: z.string(),
    priority: z.number(),
    maxNumberOfShares: z.number().nullable(),
    parValue: z.number().nullable(),
    currency: z.string().nullable(),
    hasMaximumShares: z.boolean(),
    hasParValue: z.boolean(),
    hasRightsOrRestrictions: z.boolean(),
    series: z.array(getShareSeriesSchema()).optional(),
    uuid: z.string()
  })
}

export type ShareClassSchema = z.output<ReturnType<typeof getShareClassSchema>>

export function getActiveShareClassSchema() {
  return getShareClassSchema().nullable().optional()
}

export type ActiveShareClassSchema = z.output<ReturnType<typeof getActiveShareClassSchema>>
