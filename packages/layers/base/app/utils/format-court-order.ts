export function formatCourtOrderUi(courtOrder: CourtOrder | undefined): CourtOrderPoaSchema {
  return {
    courtOrderNumber: courtOrder?.fileNumber ?? '',
    hasPoa: courtOrder?.hasPlanOfArrangement ?? false
  }
}

export function formatCourtOrderApi(courtOrder: CourtOrderPoaSchema): CourtOrder {
  return {
    fileNumber: courtOrder.courtOrderNumber ?? '',
    hasPlanOfArrangement: !!courtOrder.hasPoa
  }
}

// These values will be omitted during the edit equality check
const NON_EDITABLE_FIELDS = [
  'isEditing',
  'actions',
  'id',
  'filingId',
  'filingType',
  'orderDate'
] as const

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

function formatFiles(
  originalFiles: FileType[] = [],
  draftFiles: FileType[] = []
): FileType[] {
  const result: FileType[] = []

  // mark files not found in the original state as newly added
  for (const file of draftFiles) {
    const existsInOriginal = originalFiles.some(orig => orig.id === file.id)

    if (!existsInOriginal) {
      result.push({
        ...file,
        action: FileAction.ADDED,
        status: FileStatus.SUCCESS
      })
    } else {
      result.push(file)
    }
  }

  // mark files in original state but not draft as deleted
  for (const file of originalFiles) {
    const existsInDraft = draftFiles.some(draft => (draft.id === file.id))

    if (!existsInDraft) {
      result.push({
        ...file,
        action: FileAction.DELETED
      })
    }
  }

  return result
}

export function formatCourtOrdersSection(
  originalCourtOrders: CourtOrderResponse[],
  draftCourtOrders?: Partial<CourtOrderResponse>[]
): TableBusinessState<CourtOrderPoaFullSchema>[] {
  const schema = getCourtOrderPoaFullSchema()

  // if no draft state exists, do not modify the table state
  if (draftCourtOrders === undefined) {
    return originalCourtOrders.map((co) => {
      const parsed = schema.parse(co)
      return {
        old: structuredClone(parsed),
        new: structuredClone(parsed)
      }
    })
  }

  const formattedOriginals: TableBusinessState<CourtOrderPoaFullSchema>[] = originalCourtOrders.map((co) => {
    const oldParsed = schema.parse(co)
    const matchingDraft = draftCourtOrders.find(d => d.id === co.id)

    // if a matching id was found, check for changes
    if (matchingDraft) {
      const newParsed = schema.parse(matchingDraft)
      newParsed.files = formatFiles(oldParsed.files, newParsed.files)

      const isChanged = !isEqualOmit(oldParsed, newParsed, NON_EDITABLE_FIELDS)

      return {
        old: oldParsed,
        new: {
          ...newParsed,
          actions: isChanged ? [ActionType.CHANGED] : []
        }
      }
    }

    // if no matching id is found, item has been removed
    return {
      old: oldParsed,
      new: {
        ...oldParsed,
        actions: [ActionType.REMOVED]
      }
    }
  })

  // any draft without an ID is a newly added item
  const addedDrafts: TableBusinessState<CourtOrderPoaFullSchema>[] = draftCourtOrders
    .filter(draft => !draft.id)
    .map((draft) => {
      const parsed = schema.parse(draft)

      const formattedFiles = (parsed.files || []).map(file => ({
        ...file,
        action: FileAction.ADDED,
        status: FileStatus.SUCCESS
      }))

      return {
        old: undefined,
        new: {
          ...parsed,
          files: formattedFiles,
          actions: [ActionType.ADDED]
        }
      }
    })

  return [...formattedOriginals, ...addedDrafts]
}

export function formatCourtOrdersApi(
  courtOrders: TableBusinessState<CourtOrderPoaFullSchema>[]
): Partial<CourtOrderPayload>[] | undefined {
  // return undefined if no changes have been made
  if (!courtOrders.some(co => co.new.actions.length > 0)) {
    return undefined
  }

  // only if changes have been made, format the court orders
  return courtOrders
    .filter(co => !co.new.actions.includes(ActionType.REMOVED))
    .map((co) => {
      const isNewCourtOrder = co.old === undefined
      const newItem = co.new

      const files: CourtOrderDocPayload[] = (newItem.files || [])
        .filter(file => file.action !== 'DELETED' && Boolean(file.fileKey) && file.status !== 'ERROR') // Exclude deleted files or without a valid fileKey (failed uploads)
        .map(file => ({
          fileName: file.name,
          fileKey: file.fileKey!,
          documentType: file.type === 'CRTO' ? 'court_order' : 'supporting_document'
        }))

      return {
        id: isNewCourtOrder ? undefined : parseInt(newItem.id),
        effectOfOrder: newItem.effectOfOrder ? 'planOfArrangement' : undefined,
        fileNumber: newItem.fileNumber,
        filingType: newItem.filingType as FilingType,
        orderDetails: newItem.orderDetails || undefined,
        orderDate: newItem.orderDate || undefined,
        filingId: newItem.filingId,
        files: files.length > 0 ? files : undefined // FUTURE - not returned from API yet
      }
    })
}
