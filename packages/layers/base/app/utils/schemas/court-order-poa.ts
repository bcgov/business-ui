// https://github.com/bcgov/business-schemas/blob/main/src/registry_schemas/schemas/court_order.json
import type { FormCourtOrderPoa, FormCourtOrderPoaFields } from '#components'
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

export type FormCourtOrderPoaFieldsRef = InstanceType<typeof FormCourtOrderPoaFields>

// action a user has taken on a file
export enum CourtOrderFileAction {
  NONE = 'NONE',
  ADDED = 'ADDED',
  DELETED = 'DELETED'
}

// status of uploaded file, idle is an existing file sttached to a court order already
export enum CourtOrderFileStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

// ui state
export interface CourtOrderFileUi {
  id: string
  fileKey?: string // may be undefined during initial load
  name: string
  type: DocumentTypeClient
  action: CourtOrderFileAction
  status: CourtOrderFileStatus
  errorMessage?: string
  progress?: number
  abortController?: AbortController
}

// helper to determine if an uploaded court order file is in an active (not removed) state
export function isActiveCourtOrderFile(file: CourtOrderFileUi, excludeId?: string) {
  return file.type === DocumentTypeClient.COURT_ORDER
    && file.id !== excludeId
    && file.action !== CourtOrderFileAction.DELETED
    && [CourtOrderFileStatus.SUCCESS, CourtOrderFileStatus.IDLE, CourtOrderFileStatus.LOADING].includes(file.status)
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
      return val.map((doc: CourtOrderDocPayload | CourtOrderFileUi) => {
        const isFileType = 'id' in doc
        // normalize document type from either Client or Drs type
        const docType: DocumentTypeClient = isFileType
          ? doc.type
          : (doc.documentType === DocumentTypeClient.COURT_ORDER
            ? DocumentTypeClient.COURT_ORDER
            : DocumentTypeClient.SUPPORTING_DOCUMENT)

        return {
          id: (isFileType ? doc.id : undefined) ?? doc.fileKey ?? crypto.randomUUID(),
          fileKey: doc.fileKey,
          name: isFileType ? doc.name : doc.fileName,
          action: isFileType ? doc.action : CourtOrderFileAction.NONE,
          status: isFileType ? doc.status : CourtOrderFileStatus.IDLE,
          type: docType
        }
      })
    }, z.array(z.custom<CourtOrderFileUi>())).default([]) // FUTURE - not returned by API yet
  })
}

export type CourtOrderPoaFullSchema = z.output<ReturnType<typeof getCourtOrderPoaFullSchema>>

/**
 * Full court order schema with the cross field rules legal-api enforces on a standalone court order filing.
 * NB: use `getCourtOrderPoaFullSchema` for court orders attached to another filing type.
 */
export function getCourtOrderPoaFullFilingSchema() {
  const t = useNuxtApp().$i18n.t

  return getCourtOrderPoaFullSchema().superRefine((data, ctx) => {
    // a standalone court order filing always requires a court order number
    if (!data.fileNumber) {
      ctx.addIssue({
        code: 'custom',
        path: ['fileNumber'],
        message: t('connect.validation.fieldRequired')
      })
    }

    const activeCourtOrderFiles = (data.files ?? []).filter(file => isActiveCourtOrderFile(file))

    // either the court order text or an uploaded court order file is required
    if (!data.orderDetails?.trim() && activeCourtOrderFiles.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['orderDetails'],
        message: t('validation.enterCourtOrderOrUploadFile')
      })
    }

    // only one court order file may be attached to a filing, any number of supporting documents are allowed
    if (activeCourtOrderFiles.length > 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['files'],
        message: t('validation.onlyOneCourtOrderPerFiling')
      })
    }
  })
}

export type CourtOrderPoaFullFilingSchema = z.output<ReturnType<typeof getCourtOrderPoaFullFilingSchema>>

export function getActiveCourtOrderPoaFullSchema() {
  return getCourtOrderPoaFullSchema().nullable().optional()
}

export type ActiveCourtOrderPoaFullSchema = z.output<ReturnType<typeof getActiveCourtOrderPoaFullSchema>>
