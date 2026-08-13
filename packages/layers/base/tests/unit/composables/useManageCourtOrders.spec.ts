/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('useManageCourtOrders', () => {
  const stateKey = 'manage-court-orders'

  const mockRow = (index: number, original: any) => ({
    index,
    original
  }) as any

  const mockSubject: CourtOrderPoaFullSchema = {
    id: 'court-order-1',
    fileNumber: '12345',
    orderDetails: 'Court Order Details Text',
    effectOfOrder: 'POA',
    orderDate: '2026-01-01',
    isEditing: false,
    actions: []
  } as any

  beforeEach(() => {
    const { tableState } = useManageCourtOrders(stateKey)
    tableState.value = []
  })

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      const { tableState } = useManageCourtOrders(stateKey)
      expect(tableState.value).toEqual([])
    })
  })

  describe('addSubject', () => {
    it('should add a new subject to the table with ADDED action', () => {
      const { addSubject, tableState } = useManageCourtOrders(stateKey)

      addSubject(mockSubject)

      expect(tableState.value).toHaveLength(1)
      expect(tableState.value[0]!.new.actions).toContain(ActionType.ADDED)
      expect(tableState.value[0]!.old).toBeUndefined()
    })

    it('should ignore undefined subject', () => {
      const { addSubject, tableState } = useManageCourtOrders(stateKey)

      addSubject(undefined as any)

      expect(tableState.value).toHaveLength(0)
    })
  })

  describe('updateTable', () => {
    it('should add new row if its ID is not found in table state', () => {
      const { updateTable, tableState } = useManageCourtOrders(stateKey)
      const newState = { new: mockSubject, old: undefined }

      updateTable(newState as any)

      expect(tableState.value).toHaveLength(1)
      expect(tableState.value[0]!.new.fileNumber).toBe('12345')
    })

    it('should update an existing row by matching ID', () => {
      const { updateTable, tableState } = useManageCourtOrders(stateKey)
      tableState.value = [
        { new: { id: 'court-order-1', fileNumber: '11111' } as any, old: undefined },
        { new: { id: 'court-order-2', fileNumber: '22222' } as any, old: undefined }
      ]

      const updatedState = { new: { id: 'court-order-1', fileNumber: '99999' } as any, old: undefined }

      updateTable(updatedState)

      expect(tableState.value[0]!.new.fileNumber).toBe('99999')
      expect(tableState.value[1]!.new.fileNumber).toBe('22222')
    })

    it('should deep clone object to avoid changing source object', () => {
      const { updateTable, tableState } = useManageCourtOrders(stateKey)
      const localObj = { id: 'court-order-1', fileNumber: 'original' } as any
      const newState = { new: localObj, old: undefined }

      updateTable(newState)

      localObj.fileNumber = 'mutated'

      expect(tableState.value[0]!.new.fileNumber).toBe('original')
      expect(tableState.value[0]).not.toBe(newState)
    })
  })

  describe('removeSubject', () => {
    it('should fully remove a row if it was newly added', () => {
      const { tableState, removeSubject } = useManageCourtOrders(stateKey)
      const draftSubject = { new: mockSubject, old: undefined }
      tableState.value = [draftSubject]

      removeSubject(mockRow(0, draftSubject))

      expect(tableState.value).toHaveLength(0)
    })

    it('should mark an existing subject with the REMOVED action', () => {
      const { tableState, removeSubject } = useManageCourtOrders(stateKey)
      const existingSubject = { new: mockSubject, old: mockSubject }
      tableState.value = [existingSubject]

      removeSubject(mockRow(0, existingSubject))

      expect(tableState.value).toHaveLength(1)
      expect(tableState.value[0]!.new.actions).toContain(ActionType.REMOVED)
    })
  })

  describe('undoSubject', () => {
    it('should revert "new" state back to "old" state for an existing subject', () => {
      const { tableState, undoSubject } = useManageCourtOrders(stateKey)
      const oldVersion = { ...mockSubject, fileNumber: 'OLD_NUMBER' }
      const currentVersion = {
        new: { ...mockSubject, actions: [ActionType.REMOVED] },
        old: oldVersion
      }
      tableState.value = [currentVersion]

      undoSubject(mockRow(0, currentVersion))

      expect(tableState.value[0]!.new).toEqual(oldVersion)
    })

    it('should do nothing if old state is undefined (draft subject)', () => {
      const { tableState, undoSubject } = useManageCourtOrders(stateKey)
      const draftSubject = { new: mockSubject, old: undefined }
      tableState.value = [draftSubject]

      undoSubject(mockRow(0, draftSubject))

      expect(tableState.value[0]).toEqual(draftSubject)
    })
  })

  describe('applyEdits', () => {
    it('should ignore undefined subject', () => {
      const { applyEdits, tableState } = useManageCourtOrders(stateKey)
      const draftSubject = { new: mockSubject, old: undefined }
      tableState.value = [draftSubject]

      applyEdits(undefined as any, mockRow(0, draftSubject))

      expect(tableState.value[0]!.new.actions).toEqual([])
    })

    it('should keep the ADDED action if row has no old state', () => {
      const { tableState, applyEdits } = useManageCourtOrders(stateKey)
      const draftRow = { new: mockSubject, old: undefined }
      tableState.value = [draftRow]

      const editedSubject = { ...mockSubject, fileNumber: 'EDITED_NUMBER' }
      applyEdits(editedSubject, mockRow(0, draftRow))

      expect(tableState.value[0]!.new.actions).toHaveLength(1)
      expect(tableState.value[0]!.new.actions).toContain(ActionType.ADDED)
    })

    it('should set CHANGED action when new state !== old state', () => {
      const { tableState, applyEdits } = useManageCourtOrders(stateKey)
      const existingRow = { new: mockSubject, old: mockSubject }
      tableState.value = [existingRow]

      const editedSubject = { ...mockSubject, fileNumber: '99999_CHANGED' }
      applyEdits(editedSubject, mockRow(0, existingRow))

      expect(tableState.value[0]!.new.actions).toHaveLength(1)
      expect(tableState.value[0]!.new.actions).toContain(ActionType.CHANGED)
    })
  })

  describe('options', () => {
    it('should trigger cleanupFn when any method is called', () => {
      const cleanupFn = vi.fn()
      const {
        addSubject,
        updateTable,
        removeSubject,
        undoSubject,
        applyEdits
      } = useManageCourtOrders(stateKey, { cleanupFn })

      addSubject(mockSubject)
      expect(cleanupFn).toHaveBeenCalledTimes(1)

      updateTable({ new: mockSubject, old: undefined })
      expect(cleanupFn).toHaveBeenCalledTimes(2)

      const draftRow = mockRow(0, { new: mockSubject, old: undefined })
      removeSubject(draftRow)
      expect(cleanupFn).toHaveBeenCalledTimes(3)

      const existingRow = mockRow(0, { new: mockSubject, old: mockSubject })
      removeSubject(existingRow)
      expect(cleanupFn).toHaveBeenCalledTimes(4)

      undoSubject(existingRow)
      expect(cleanupFn).toHaveBeenCalledTimes(5)

      applyEdits(mockSubject, existingRow)
      expect(cleanupFn).toHaveBeenCalledTimes(6)
    })
  })
})
