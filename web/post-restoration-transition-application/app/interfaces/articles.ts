import * as z from 'zod'

export interface Articles {
  // current date in iso string format
  currentDate: string | undefined
  // list of previous resolutions dates
  resolutionDates: string[]
  // tracks if the current filing had special resolution changes
  specialResolutionChanges: boolean
}

export const EmptyArticles = (): Articles => ({
  currentDate: undefined,
  resolutionDates: [],
  specialResolutionChanges: false
})

export interface ApiResolutions {
  date: string
  id: number
  type: string
}

export const articlesSchema = z.object({
  currentDate: z.date().optional(),
  resolutionDates: z.array(z.string()),
  specialResolutionChanges: z.boolean()
}).refine((data) => {
  if (data.specialResolutionChanges) {
    return data.currentDate !== undefined
  }
  return true
}, {
  message: 'errors.articles',
  path: ['currentDate']
})
