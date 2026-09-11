/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from 'vitest'

describe('useManageParties', () => {
  const stateKey = 'manage-parties-test'

  const mockRow = (index: number, original: any) => ({
    index,
    original
  }) as any

  const mockParty = {
    actions: [],
    name: { partyType: PartyType.PERSON, firstName: 'Tester', middleName: '', lastName: 'Testing' },
    address: {
      deliveryAddress: { street: '123 Main St', city: 'Victoria', country: 'CA', region: 'BC', postalCode: 'V1X 1X1' },
      mailingAddress: { street: '123 Main St', city: 'Victoria', country: 'CA', region: 'BC', postalCode: 'V1X 1X1' },
      sameAs: true
    },
    roles: [{ roleType: RoleTypeUi.CUSTODIAN }],
    email: 'tester.testing@example.com',
    id: '',
    isEditing: false
  }

  beforeEach(() => {
    const { tableState, addingParty, expandedState } = useManageParties(stateKey)
    tableState.value = []
    addingParty.value = false
    expandedState.value = undefined
  })

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const { tableState, addingParty, expandedState } = useManageParties(stateKey)
      expect(tableState.value).toEqual([])
      expect(addingParty.value).toBe(false)
      expect(expandedState.value).toBeUndefined()
    })
  })

  describe('hasChanges', () => {
    it('should return false when tableState has no items or no actions', () => {
      const { tableState, hasChanges } = useManageParties(stateKey)

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
      const { tableState, hasChanges } = useManageParties(stateKey)

      tableState.value = [
        {
          old: { id: '1', actions: [] },
          new: { id: '1', actions: [ActionType.ADDED] }
        }
      ] as any

      expect(hasChanges.value).toBe(true)
    })
  })

  describe('addNewParty', () => {
    it('should add a new party to the table with ADDED action', () => {
      const { addNewParty, tableState } = useManageParties(stateKey)

      addNewParty(mockParty as any)

      expect(tableState.value).toHaveLength(1)
      expect(tableState.value[0]!.new.actions).toContain(ActionType.ADDED)
      expect(tableState.value[0]!.old).toBeUndefined()
    })

    it('should ignore undefined party', () => {
      const { addNewParty, tableState } = useManageParties(stateKey)
      addNewParty(undefined)
      expect(tableState.value).toHaveLength(0)
    })
  })

  describe('removeParty', () => {
    it('should fully remove a row if it was a newly added party', () => {
      const { tableState, removeParty } = useManageParties(stateKey)
      const newParty = { new: mockParty, old: undefined }
      tableState.value = [newParty]

      removeParty(mockRow(0, newParty))

      expect(tableState.value).toHaveLength(0)
    })

    it('should add REMOVED action for existing party', () => {
      const { tableState, removeParty } = useManageParties(stateKey)
      const existingParty = { new: mockParty, old: mockParty }
      tableState.value = [existingParty]

      removeParty(mockRow(0, existingParty))

      expect(tableState.value).toHaveLength(1)
      expect(tableState.value[0]!.new.actions).toContain(ActionType.REMOVED)
    })
  })

  describe('undoParty', () => {
    it('should revert "new" state to "old" state', () => {
      const { tableState, undoParty } = useManageParties(stateKey)
      const oldVersion = { ...mockParty, email: 'original@example.com' }
      const currentVersion = {
        new: { ...mockParty, actions: [ActionType.EMAIL_CHANGED] },
        old: oldVersion
      }
      tableState.value = [currentVersion]

      undoParty(mockRow(0, currentVersion))

      expect(tableState.value[0]!.new).toEqual(oldVersion)
    })

    it('should do nothing if old state is undefined', () => {
      const { tableState, undoParty } = useManageParties(stateKey)
      const currentState = { new: mockParty, old: undefined }
      tableState.value = [currentState]

      undoParty(mockRow(0, currentState))

      expect(tableState.value[0]).toEqual(currentState)
    })
  })

  describe('applyTableEdits', () => {
    it('should keep the ADDED action if row has no old state', () => {
      const { tableState, applyTableEdits } = useManageParties(stateKey)
      const newPartyRow = { new: mockParty, old: undefined }
      tableState.value = [newPartyRow]

      const editedParty = { ...mockParty, email: 'changed@example.com' }
      applyTableEdits(editedParty as any, mockRow(0, newPartyRow))

      expect(tableState.value[0]!.new.actions).toEqual([ActionType.ADDED])
    })

    it('should add ADDRESS_CHANGED action if addresses are different', () => {
      const { tableState, applyTableEdits } = useManageParties(stateKey)
      const existing = {
        new: mockParty,
        old: { ...mockParty, address: { ...mockParty.address, sameAs: false } }
      }
      tableState.value = [existing]

      applyTableEdits(mockParty as any, mockRow(0, existing))

      expect(tableState.value[0]!.new.actions).toEqual([ActionType.ADDRESS_CHANGED])
    })

    it('should add EMAIL_CHANGED action if email is different', () => {
      const { tableState, applyTableEdits } = useManageParties(stateKey)
      const existing = {
        new: mockParty,
        old: { ...mockParty, email: 'old.email@example.com' }
      }
      tableState.value = [existing]

      applyTableEdits(mockParty as any, mockRow(0, existing))

      expect(tableState.value[0]!.new.actions).toEqual([ActionType.EMAIL_CHANGED])
    })

    it('should have no actions if edited data matches old state exactly', () => {
      const { tableState, applyTableEdits } = useManageParties(stateKey)
      const existing = { new: mockParty, old: mockParty }
      tableState.value = [existing]

      applyTableEdits(mockParty as any, mockRow(0, existing))

      expect(tableState.value[0]!.new.actions).toHaveLength(0)
    })
  })
})
