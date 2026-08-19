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
      return {
        old: undefined,
        new: {
          ...parsed,
          actions: [ActionType.ADDED]
        }
      }
    })

  return [...formattedOriginals, ...addedDrafts]
}

export function formatCourtOrdersApi(
  courtOrders: TableBusinessState<CourtOrderPoaFullSchema>[]
): Partial<CourtOrderResponse>[] | undefined {
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

      return {
        id: isNewCourtOrder ? undefined : parseInt(newItem.id),
        effectOfOrder: newItem.effectOfOrder ? 'planOfArrangement' : undefined,
        fileNumber: newItem.fileNumber,
        filingType: newItem.filingType as FilingType,
        orderDetails: newItem.orderDetails || undefined,
        orderDate: newItem.orderDate || undefined,
        filingId: newItem.filingId,
        files: newItem.files // FUTURE - not returned from API yet
      }
    })
}
