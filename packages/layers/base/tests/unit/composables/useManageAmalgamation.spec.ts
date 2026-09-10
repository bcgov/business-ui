/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('useManageAmalgamation', () => {
  const stateKey = 'test-amalgamation'
  const mockCleanupFn = vi.fn()

  const createMockRow = (
    item: AmalgamationTableRow,
    oldItem?: AmalgamationTableRow
  ): TableBusinessRow<AmalgamationTableRow> =>
    ({
      original: {
        old: oldItem,
        new: item
      }
    }) as unknown as TableBusinessRow<AmalgamationTableRow>

  beforeEach(() => {
    clearNuxtState()
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('initializes tableState with an empty array', () => {
      const { tableState } = useManageAmalgamation(stateKey)
      expect(tableState.value).toEqual([])
    })

    it('initializes statementState with schema defaults', () => {
      const { statementState } = useManageAmalgamation(stateKey)
      expect(statementState.value.new).toBeDefined()
      expect(statementState.value.old).toEqual(statementState.value.new)
    })

    it('evaluates hasChanges as false initially', () => {
      const { hasChanges } = useManageAmalgamation(stateKey)
      expect(hasChanges.value).toBe(false)
    })
  })

  describe('addSubject', () => {
    it('adds a new subject with ActionType.ADDED and triggers cleanup', () => {
      const { tableState, addSubject } = useManageAmalgamation(stateKey, { cleanupFn: mockCleanupFn })
      const mockSubject = { id: '1', legalName: 'Business A' } as ActiveAmalgamationCorrectSchema

      addSubject(mockSubject)

      expect(tableState.value).toHaveLength(1)
      expect(tableState.value[0]).toEqual({
        old: undefined,
        new: { ...mockSubject, actions: [ActionType.ADDED] }
      })
      expect(mockCleanupFn).toHaveBeenCalledTimes(1)
    })

    it('does nothing if subject is undefined or null', () => {
      const { tableState, addSubject } = useManageAmalgamation(stateKey, { cleanupFn: mockCleanupFn })

      addSubject(undefined)

      expect(tableState.value).toHaveLength(0)
      expect(mockCleanupFn).not.toHaveBeenCalled()
    })
  })

  describe('editSubject', () => {
    it('retains ADDED badge when editing a newly added item', () => {
      const { tableState, editSubject } = useManageAmalgamation(stateKey)
      const newItem = { id: '1', legalName: 'New Business', actions: [ActionType.ADDED] } as AmalgamationTableRow
      const row = createMockRow(newItem, undefined)

      editSubject({ ...newItem, legalName: 'Updated Name' }, row)

      expect(tableState.value[0]!.new.actions).toEqual([ActionType.ADDED])
    })

    it('applies CHANGED badge when an existing item is modified', () => {
      const { tableState, editSubject } = useManageAmalgamation(stateKey)
      const oldItem = { id: '1', legalName: 'Original Name', actions: [] } as any
      const newItem = { id: '1', legalName: 'Original Name', actions: [] } as any
      const row = createMockRow(newItem, oldItem)

      editSubject({ ...newItem, legalName: 'Changed Name' }, row)

      expect(tableState.value[0]!.new.actions).toEqual([ActionType.CHANGED])
    })

    it('clears CHANGED badge if edits are reverted to original values', () => {
      const { tableState, editSubject } = useManageAmalgamation(stateKey)
      const oldItem = { id: '1', legalName: 'Original Name', actions: [] } as any
      const newItem = { id: '1', legalName: 'Changed Name', actions: [ActionType.CHANGED] } as any

      tableState.value = [{ old: oldItem, new: newItem }]

      const row = createMockRow(newItem, oldItem)

      editSubject({ ...newItem, legalName: 'Original Name' }, row)

      expect(tableState.value[0]!.new.actions).toEqual([])
    })
  })

  describe('removeSubject', () => {
    it('removes a newly added item completely from tableState', () => {
      const { tableState, addSubject, removeSubject } = useManageAmalgamation(stateKey, { cleanupFn: mockCleanupFn })
      const mockSubject = { id: '1', legalName: 'Business A' } as ActiveAmalgamationCorrectSchema

      addSubject(mockSubject)
      mockCleanupFn.mockClear()

      const row = createMockRow(tableState.value[0]!.new, undefined)
      removeSubject(row)

      expect(tableState.value).toHaveLength(0)
      expect(mockCleanupFn).toHaveBeenCalledTimes(1)
    })

    it('applies REMOVED badge to an existing item without deleting from state', () => {
      const { tableState, removeSubject } = useManageAmalgamation(stateKey)
      const oldItem = { id: '1', legalName: 'Existing Co' } as AmalgamationTableRow
      const newItem = { ...oldItem, actions: [] }
      const row = createMockRow(newItem, oldItem)

      removeSubject(row)

      expect(tableState.value).toHaveLength(1)
      expect(tableState.value[0]!.new.actions).toEqual([ActionType.REMOVED])
    })
  })

  describe('undoSubject', () => {
    it('resets new state back to pristine old state', () => {
      const { tableState, editSubject, undoSubject } = useManageAmalgamation(stateKey)
      const oldItem = { id: '1', legalName: 'Pristine Name', actions: [] } as any
      const newItem = { id: '1', legalName: 'Pristine Name', actions: [] } as any
      const row = createMockRow(newItem, oldItem)

      editSubject({ ...newItem, legalName: 'Edited Name' }, row)
      expect(tableState.value[0]!.new.legalName).toBe('Edited Name')

      const editedRow = createMockRow(tableState.value[0]!.new, oldItem)
      undoSubject(editedRow)

      expect(tableState.value[0]!.new).toEqual(oldItem)
    })

    it('does nothing if old state is undefined', () => {
      const { tableState, undoSubject } = useManageAmalgamation(stateKey)
      const row = createMockRow({ id: '1' } as AmalgamationTableRow, undefined)

      undoSubject(row)
      expect(tableState.value).toHaveLength(0)
    })
  })

  describe('updateStatement', () => {
    it('applies ActionType.CHANGED if courtApproval value changes', () => {
      const { statementState, updateStatement } = useManageAmalgamation(stateKey, { cleanupFn: mockCleanupFn })

      statementState.value = {
        old: { courtApproval: false, isEditing: false, actions: [] },
        new: { courtApproval: false, isEditing: false, actions: [] }
      }

      updateStatement({ courtApproval: true, isEditing: true, actions: [] })

      expect(statementState.value.new.actions).toEqual([ActionType.CHANGED])
      expect(statementState.value.new.courtApproval).toBe(true)
      expect(statementState.value.new.isEditing).toBe(false)
      expect(mockCleanupFn).toHaveBeenCalledTimes(1)
    })

    it('removes ActionType.CHANGED if value is restored to original state', () => {
      const { statementState, updateStatement } = useManageAmalgamation(stateKey)

      statementState.value = {
        old: { courtApproval: false, isEditing: false, actions: [] },
        new: { courtApproval: true, isEditing: false, actions: [ActionType.CHANGED] }
      }

      updateStatement({ courtApproval: false, isEditing: true, actions: [] })

      expect(statementState.value.new.actions).toEqual([])
      expect(statementState.value.new.courtApproval).toBe(false)
    })
  })

  describe('undoStatement', () => {
    it('resets statement state back to pristine old state', () => {
      const { statementState, updateStatement, undoStatement } = useManageAmalgamation(stateKey)

      statementState.value = {
        old: { courtApproval: false, isEditing: false, actions: [] },
        new: { courtApproval: false, isEditing: false, actions: [] }
      }

      updateStatement({ courtApproval: true, isEditing: true, actions: [] })
      expect(statementState.value.new.courtApproval).toBe(true)

      undoStatement()

      expect(statementState.value.new).toEqual(statementState.value.old)
      expect(statementState.value.new.courtApproval).toBe(false)
    })
  })

  describe('hasChanges', () => {
    it('returns true when tableState has an item with actions', () => {
      const { hasChanges, addSubject } = useManageAmalgamation(stateKey)

      expect(hasChanges.value).toBe(false)
      addSubject({ id: '1', legalName: 'Business A' } as ActiveAmalgamationCorrectSchema)
      expect(hasChanges.value).toBe(true)
    })

    it('returns true when statementState has actions', () => {
      const { hasChanges, updateStatement, statementState } = useManageAmalgamation(stateKey)

      statementState.value = {
        old: { courtApproval: false, isEditing: false, actions: [] },
        new: { courtApproval: false, isEditing: false, actions: [] }
      }

      expect(hasChanges.value).toBe(false)
      updateStatement({ courtApproval: true, isEditing: false, actions: [] })
      expect(hasChanges.value).toBe(true)
    })
  })
})
