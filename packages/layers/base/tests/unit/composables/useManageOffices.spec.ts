/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from 'vitest'

describe('useManageOffices', () => {
  const stateKey = 'manage-offices-test'

  const mockRow = (index: number, original: any) => ({
    index,
    original
  }) as any

  const mockOffice = {
    id: '123',
    type: OfficeType.REGISTERED,
    actions: [],
    address: {
      deliveryAddress: { street: '123 Main St', city: 'Victoria', country: 'CA', region: 'BC', postalCode: 'V1X 1X1' },
      mailingAddress: { street: '123 Main St', city: 'Victoria', country: 'CA', region: 'BC', postalCode: 'V1X 1X1' },
      sameAs: true
    },
    isEditing: false
  }

  beforeEach(() => {
    const { tableState } = useManageOffices(stateKey)
    tableState.value = []
  })

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const { tableState } = useManageOffices(stateKey)
      expect(tableState.value).toEqual([])
    })
  })

  describe('hasChanges', () => {
    it('should return false when tableState has no items or no actions', () => {
      const { tableState, hasChanges } = useManageOffices(stateKey)

      tableState.value = []
      expect(hasChanges.value).toBe(false)

      tableState.value = [
        {
          old: { id: '1', actions: [] },
          new: { id: '1', actions: [] }
        }
      ] as any
      expect(hasChanges.value).toBe(false)
    })

    it('should return true when any item has populated actions', () => {
      const { tableState, hasChanges } = useManageOffices(stateKey)

      tableState.value = [
        {
          old: { id: '1', actions: [] },
          new: { id: '1', actions: [ActionType.CHANGED] }
        }
      ] as any

      expect(hasChanges.value).toBe(true)
    })
  })

  describe('addSubject', () => {
    it('should add a new office to the table with ADDED action', () => {
      const { addSubject, tableState } = useManageOffices(stateKey)

      addSubject(mockOffice as any)

      expect(tableState.value).toHaveLength(1)
      expect(tableState.value[0]!.new.actions).toContain(ActionType.ADDED)
      expect(tableState.value[0]!.old).toBeUndefined()
    })

    it('should ignore undefined office', () => {
      const { addSubject, tableState } = useManageOffices(stateKey)
      addSubject(undefined as any)
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

      updateTable(updatedRow)

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

  describe('removeSubject', () => {
    it('should fully remove a row if it was a newly added office', () => {
      const { tableState, removeSubject } = useManageOffices(stateKey)
      const newOffice = { new: mockOffice, old: undefined }
      tableState.value = [newOffice]

      removeSubject(mockRow(0, newOffice))

      expect(tableState.value).toHaveLength(0)
    })

    it('should add REMOVED action for existing office', () => {
      const { tableState, removeSubject } = useManageOffices(stateKey)
      const existingOffice = { new: mockOffice, old: mockOffice }
      tableState.value = [existingOffice]

      removeSubject(mockRow(0, existingOffice))

      expect(tableState.value).toHaveLength(1)
      expect(tableState.value[0]!.new.actions).toContain(ActionType.REMOVED)
    })
  })

  describe('undoSubject', () => {
    it('should revert "new" state to "old" state', () => {
      const { tableState, undoSubject } = useManageOffices(stateKey)
      const oldVersion = { ...mockOffice, type: OfficeType.RECORDS }
      const currentVersion = {
        new: { ...mockOffice, actions: [ActionType.REMOVED] },
        old: oldVersion
      }
      tableState.value = [currentVersion]

      undoSubject(mockRow(0, currentVersion))

      expect(tableState.value[0]!.new).toEqual(oldVersion)
      expect(tableState.value[0]!.new.actions).toEqual(oldVersion.actions || [])
    })

    it('should do nothing if old state is undefined', () => {
      const { tableState, undoSubject } = useManageOffices(stateKey)
      const currentState = { new: mockOffice, old: undefined }
      tableState.value = [currentState]

      undoSubject(mockRow(0, currentState))

      expect(tableState.value[0]).toEqual(currentState)
    })
  })
})
