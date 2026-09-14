// https://github.com/bcgov/business-schemas/blob/main/src/registry_schemas/schemas/correction_amalgamation.json
// temp formatter only, changes tbd in correction implementation ticket
import { cloneDeep, merge } from 'es-toolkit'
import type { z } from 'zod'

const NON_EDITABLE_FIELDS = ['isEditing', 'actions', 'id'] as const

function isBcBusiness(
  data: AmalgamationTableRow
): data is AmalgamationTableRow & AmalBusinessBC {
  return 'legalType' in data || 'mailingAddress' in data
}

type AmalgamationCorrectInput = z.input<ReturnType<typeof getAmalgamationCorrectSchema>>
type ProcessBusinessData = AmalgamationCorrectInput | Partial<AmalgamationTableRow>

export function formatAmalCorrectSection(
  originalData: Amalgamation,
  draftData?: Partial<Amalgamation>
): {
  tableState: TableBusinessState<AmalgamationTableRow>[]
  statementState: TableBusinessState<AmalgamationCorrectStatementSchema>
} {
  const schema = getAmalgamationCorrectSchema()
  const stmntSchema = getAmalgamationCorrectStatementSchema()

  const processBusiness = (data: ProcessBusinessData): AmalgamationTableRow => {
    const cloned = cloneDeep(data)

    // BC businesses are not editable, do not apply defaults with parse
    if (isBcBusiness(cloned as AmalgamationTableRow)) {
      return {
        ...cloned,
        id: String(cloned.id),
        isEditing: false,
        actions: []
      } as BCBusinessTableRow
    }

    const parsed = schema.parse(cloned)
    return merge(cloned, parsed)
  }

  const originalBusinesses = originalData.amalgamatingBusinesses || []
  const draftBusinesses = draftData?.amalgamatingBusinesses

  let tableState: TableBusinessState<AmalgamationTableRow>[] = []

  // if no draft businesses, return formatted API response
  if (!draftBusinesses) {
    tableState = originalBusinesses.map((b) => {
      const processed = processBusiness(b)
      return {
        old: cloneDeep(processed),
        new: cloneDeep(processed)
      }
    })
  } else {
    // Process original businesses against draft state
    const formattedOriginals: TableBusinessState<AmalgamationTableRow>[] = originalBusinesses.map((orig) => {
      const oldParsed = processBusiness(orig)

      // BC Businesses are not editable so old state should be preserved
      if (isBcBusiness(oldParsed)) {
        return {
          old: cloneDeep(oldParsed),
          new: cloneDeep(oldParsed)
        }
      }

      const matchingDraft = draftBusinesses.find(d => d.id === orig.id)

      // If ExBC business is missing in draft, mark as REMOVED
      if (!matchingDraft) {
        return {
          old: oldParsed,
          new: {
            ...oldParsed,
            actions: [ActionType.REMOVED]
          }
        }
      }

      const newParsed = processBusiness(matchingDraft)
      const isChanged = !isEqualOmit(oldParsed, newParsed, NON_EDITABLE_FIELDS)

      return {
        old: oldParsed,
        new: {
          ...newParsed,
          actions: isChanged ? [ActionType.CHANGED] : []
        }
      }
    })

    // any draft without an ID is a newly added item
    const addedDrafts: TableBusinessState<AmalgamationTableRow>[] = draftBusinesses
      .filter(draft => !draft.id)
      .map((draft) => {
        const parsed = processBusiness(draft)
        return {
          old: undefined,
          new: {
            ...parsed,
            actions: [ActionType.ADDED]
          }
        }
      })

    tableState = [...formattedOriginals, ...addedDrafts]
  }

  const oldStatement = stmntSchema.parse(originalData)

  if (!draftData) {
    return {
      tableState,
      statementState: {
        old: cloneDeep(oldStatement),
        new: cloneDeep(oldStatement)
      }
    }
  }

  const newStatement = stmntSchema.parse(draftData)
  const isStatementChanged = !isEqualOmit(oldStatement, newStatement, ['isEditing', 'actions'])

  const statementState = {
    old: cloneDeep(oldStatement),
    new: {
      ...cloneDeep(newStatement),
      actions: isStatementChanged ? [ActionType.CHANGED] : []
    }
  }

  return {
    tableState,
    statementState
  }
}

export function formatAmalCorrectApi(
  tableState: TableBusinessState<AmalgamationTableRow>[],
  statementState: TableBusinessState<AmalgamationCorrectStatementSchema>
): Amalgamation | undefined {
  const hasTableChanges = tableState.some(row => row.new.actions.length > 0)
  const hasStatementChanges = statementState.new.actions.length > 0

  // Return undefined if no changes have been made
  if (!hasTableChanges && !hasStatementChanges) {
    return undefined
  }

  const amalgamatingBusinesses = tableState
    .filter((row) => {
      const item = row.new
      const isRemoved = item.actions.includes(ActionType.REMOVED)
      return !isRemoved && !isBcBusiness(row.new)
    })
    .map((row) => {
      const isNewBusiness = row.old === undefined
      const item = row.new

      return {
        // `id` is required in schema, but omitting/allowing `undefined` for new draft records
        // API will need update if we need to allow adding a business
        id: isNewBusiness ? undefined : parseInt(item.id),
        role: item.role,
        identifier: item.identifier,
        legalName: item.legalName,
        foreignJurisdiction: item.foreignJurisdiction
      } as AmalBusinessExBC
    })
  return {
    amalgamatingBusinesses,
    courtApproval: statementState.new.courtApproval
  }
}
