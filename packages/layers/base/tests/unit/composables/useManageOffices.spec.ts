/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from 'vitest'

describe('useManageOffices', () => {
  const stateKey = 'manage-offices-test'

  const mockRow = (index: number, original: any) => ({
    index,
    original
  }) as any

  const mockOffice = {
    type: OfficeType.REGISTERED,
    actions: [],
    address: {
      deliveryAddress: { street: '123 Main St', city: 'Victoria', country: 'CA', region: 'BC', postalCode: 'V1X 1X1' },
      mailingAddress: { street: '123 Main St', city: 'Victoria', country: 'CA', region: 'BC', postalCode: 'V1X 1X1' },
      sameAs: true
    }
  }

  beforeEach(() => {
    const { tableState, addingOffice, expandedState } = useManageOffices(stateKey)
    tableState.value = []
    addingOffice.value = false
    expandedState.value = undefined
  })

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const { tableState, addingOffice, expandedState } = useManageOffices(stateKey)
      expect(tableState.value).toEqual([])
      expect(addingOffice.value).toBe(false)
      expect(expandedState.value).toBeUndefined()
    })
  })

  describe('addNewOffice', () => {
    it('should add a new office to the table with ADDED action', () => {
      const { addNewOffice, tableState } = useManageOffices(stateKey)

      addNewOffice(mockOffice as any)

      expect(tableState.value).toHaveLength(1)
      expect(tableState.value[0]!.new.actions).toContain(ActionType.ADDED)
      expect(tableState.value[0]!.old).toBeUndefined()
    })

    it('should ignore undefined office', () => {
      const { addNewOffice, tableState } = useManageOffices(stateKey)
      addNewOffice(undefined as any)
      expect(tableState.value).toHaveLength(0)
    })
  })

  describe('updateTable', () => {
    it('should update the correct row by index', () => {
      const { updateTable, tableState } = useManageOffices(stateKey)
      tableState.value = [
        { new: { type: 'office1' } as any, old: undefined },
        { new: { type: 'office2' } as any, old: undefined }
      ]

      const updatedRow = { new: { type: 'updated-office' } as any, old: undefined }
      const rowToUpdate = mockRow(0, tableState.value[0])

      updateTable(updatedRow, rowToUpdate)

      expect(tableState.value[0]!.new.type).toBe('updated-office')
      expect(tableState.value[1]!.new.type).toBe('office2')
    })

    it('should deep clone and not pass refs', () => {
      const { updateTable, tableState } = useManageOffices(stateKey)
      const localObj = { type: 'original' } as any
      const newState = { new: localObj, old: undefined }

      updateTable(newState)

      localObj.type = 'mutated'

      expect(tableState.value[0]!.new.type).toBe('original')
      expect(tableState.value[0]).not.toBe(newState)
    })
  })

  describe('removeOffice', () => {
    it('should fully remove a row if it was a newly added office', () => {
      const { tableState, removeOffice } = useManageOffices(stateKey)
      const newOffice = { new: mockOffice, old: undefined }
      tableState.value = [newOffice]

      removeOffice(mockRow(0, newOffice))

      expect(tableState.value).toHaveLength(0)
    })

    it('should add REMOVED action for existing office', () => {
      const { tableState, removeOffice } = useManageOffices(stateKey)
      const existingOffice = { new: mockOffice, old: mockOffice }
      tableState.value = [existingOffice]

      removeOffice(mockRow(0, existingOffice))

      expect(tableState.value).toHaveLength(1)
      expect(tableState.value[0]!.new.actions).toContain(ActionType.REMOVED)
    })
  })

  describe('undoOffice', () => {
    it('should revert "new" state to "old" state', () => {
      const { tableState, undoOffice } = useManageOffices(stateKey)
      const oldVersion = { ...mockOffice, type: OfficeType.RECORDS }
      const currentVersion = {
        new: { ...mockOffice, actions: [ActionType.REMOVED] },
        old: oldVersion
      }
      tableState.value = [currentVersion]

      undoOffice(mockRow(0, currentVersion))

      expect(tableState.value[0]!.new).toEqual(oldVersion)
      expect(tableState.value[0]!.new.actions).toEqual(oldVersion.actions || [])
    })

    it('should do nothing if old state is undefined', () => {
      const { tableState, undoOffice } = useManageOffices(stateKey)
      const currentState = { new: mockOffice, old: undefined }
      tableState.value = [currentState]

      undoOffice(mockRow(0, currentState))

      expect(tableState.value[0]).toEqual(currentState)
    })
  })

  describe('applyTableEdits', () => {
    it('should keep the ADDED action if row has no old state', () => {
      const { tableState, applyTableEdits } = useManageOffices(stateKey)
      const newOfficeRow = { new: mockOffice, old: undefined }
      tableState.value = [newOfficeRow]

      const editedOffice = { ...mockOffice, type: OfficeType.RECORDS }
      applyTableEdits(editedOffice as any, mockRow(0, newOfficeRow))

      expect(tableState.value[0]!.new.actions).toHaveLength(1)
      expect(tableState.value[0]!.new.actions).toContain(ActionType.ADDED)
    })

    it('should add ADDRESS_CHANGED action if addresses are different', () => {
      const { tableState, applyTableEdits } = useManageOffices(stateKey)
      const existing = {
        new: mockOffice,
        old: { ...mockOffice, address: { ...mockOffice.address, sameAs: false } }
      }
      tableState.value = [existing]

      applyTableEdits(mockOffice as any, mockRow(0, existing))

      expect(tableState.value[0]!.new.actions).toHaveLength(1)
      expect(tableState.value[0]!.new.actions).toContain(ActionType.ADDRESS_CHANGED)
    })

    it('should have no actions if edited data matches old state exactly', () => {
      const { tableState, applyTableEdits } = useManageOffices(stateKey)
      const existing = { new: mockOffice, old: mockOffice }
      tableState.value = [existing]

      applyTableEdits(mockOffice as any, mockRow(0, existing))

      expect(tableState.value[0]!.new.actions).toHaveLength(0)
    })
  })
})
