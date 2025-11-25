import * as z from 'zod'

export interface Articles {
  // current date in iso string format
  currentDate: string | undefined
  // list of previous resolutions dates
  resolutionDates: string[]
  // tracks if the current filing had special resolution changes
  specialResolutionChanges: boolean
  // track the incorp date for validation only
  incorpDate?: string | undefined
}

export const EmptyArticles = (): Articles => ({
  currentDate: undefined,
  resolutionDates: [],
  specialResolutionChanges: false,
  incorpDate: undefined
})

export interface ApiResolutions {
  date: string
  id: number
  type: string
}

export const articlesSchema = z.object({
  currentDate: z.string().optional(),
  resolutionDates: z.array(z.string()),
  specialResolutionChanges: z.boolean(),
  incorpDate: z.string().optional()
}).refine((data) => {
  if (data.specialResolutionChanges) {
    return data.currentDate !== undefined && data.currentDate !== ''
  }

  return true
}, {
  message: 'errors.articles',
  path: ['currentDate']
}).refine((data) => {
  if (data.currentDate && new Date(data.currentDate) > new Date()) {
    return false
  } else if (data.currentDate && data.incorpDate && new Date(data.currentDate) < new Date(data.incorpDate)) {
    return false
  }
  return true
}, {
  message: 'errors.articlesDateRange',
  path: ['currentDate']
})
