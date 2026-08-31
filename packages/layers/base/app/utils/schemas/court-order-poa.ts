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

// action a user has taken on a file
export enum FileAction {
  NONE = 'NONE',
  ADDED = 'ADDED',
  DELETED = 'DELETED'
}

// status of uploaded file, idle is an existing file sttached to a court order already
export enum FileStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
// ui state
export interface FileType {
  id: string
  fileKey?: string // may be undefined during initial load
  name: string
  type: string
  action: FileAction
  status: FileStatus
  errorMessage?: string
  abortController?: AbortController
}

export function getCourtOrderPoaFullSchema() {
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
    fileNumber: z.string()
      .min(5, t('connect.validation.minChars', { count: 5 }))
      .max(20, t('connect.validation.maxChars', { count: 20 }))
      .default(''),
    effectOfOrder: z.preprocess(
      val => (typeof val === 'boolean' ? val : val === 'planOfArrangement'), // convert DB value into boolean for UI usage
      z.boolean().default(false)
    ),
    orderDetails: z.preprocess(
      val => (!val ? null : val),
      z.string().nullable()
    ),
    filingId: z.number()
      .default(-1),
    filingType: z.enum(FilingType)
      .nullable()
      .optional(),
    orderDate: z.string()
      .nullable()
      .optional(),
    files: z.preprocess((val) => {
      if (!Array.isArray(val)) {
        return []
      }
      return val.map((doc: CourtOrderDocPayload | FileType) => {
        const isFileType = 'id' in doc

        return {
          id: (isFileType ? doc.id : undefined) ?? doc.fileKey ?? crypto.randomUUID(),
          fileKey: doc.fileKey,
          name: isFileType ? doc.name : doc.fileName,
          type: isFileType ? doc.type : (doc.documentType === 'court_order' ? 'CRTO' : 'SUPP'),
          action: isFileType ? doc.action : FileAction.NONE,
          status: isFileType ? doc.status : FileStatus.IDLE
        }
      })
    }, z.array(z.custom<FileType>())).default([]) // FUTURE - not returned by API yet
  })
}

export type CourtOrderPoaFullSchema = z.output<ReturnType<typeof getCourtOrderPoaFullSchema>>

export function getActiveCourtOrderPoaFullSchema() {
  return getCourtOrderPoaFullSchema().nullable().optional()
}

export type ActiveCourtOrderPoaFullSchema = z.output<ReturnType<typeof getActiveCourtOrderPoaFullSchema>>
