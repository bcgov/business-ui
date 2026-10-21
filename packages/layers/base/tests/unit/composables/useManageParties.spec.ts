/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('useManageParties', () => {
  const stateKey = 'manage-parties-test'

  const mockRow = (index: number, original: any) => ({
    index,
    id: original.new.id,
    original
  }) as any

  const mockParty = {
    actions: [],
    name: {
      partyType: PartyType.PERSON,
      firstName: 'Tester',
      middleName: '',
      lastName: 'Testing',
      hasPreferredName: false,
      businessName: ''
    },
    address: {
      deliveryAddress: { street: '123 Main St', city: 'Victoria', country: 'CA', region: 'BC', postalCode: 'V1X 1X1' },
      mailingAddress: { street: '123 Main St', city: 'Victoria', country: 'CA', region: 'BC', postalCode: 'V1X 1X1' },
      sameAs: true
    },
    roles: [{ roleType: RoleTypeUi.CUSTODIAN }],
    email: 'tester.testing@example.com',
    id: 'party-1',
    isEditing: false
  }

  beforeEach(() => {
    const { tableState } = useManageParties(stateKey)
    tableState.value = []
  })

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const { tableState } = useManageParties(stateKey)
      expect(tableState.value).toEqual([])
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

  describe('updateTable', () => {
    it('should update the row matching new.id regardless of its position', () => {
      const { tableState, updateTable } = useManageParties(stateKey)
      const first = { new: { ...mockParty, id: 'a' }, old: undefined }
      const second = { new: { ...mockParty, id: 'b' }, old: undefined }
      tableState.value = [first, second] as any

      updateTable({ new: { ...second.new, email: 'updated@example.com' }, old: undefined } as any)

      expect(tableState.value).toHaveLength(2)
      expect(tableState.value[0]!.new.email).toBe(mockParty.email)
      expect(tableState.value[1]!.new.email).toBe('updated@example.com')
    })

    it('should add a new row when the id is not found', () => {
      const { tableState, updateTable } = useManageParties(stateKey)
      tableState.value = [{ new: { ...mockParty, id: 'a' }, old: undefined }] as any

      updateTable({ new: { ...mockParty, id: 'b' }, old: undefined } as any)

      expect(tableState.value.map(p => p.new.id)).toEqual(['a', 'b'])
    })

    it('should call the cleanupFn', () => {
      const cleanupFn = vi.fn()
      const { updateTable } = useManageParties(stateKey, { cleanupFn })

      updateTable({ new: mockParty, old: undefined } as any)

      expect(cleanupFn).toHaveBeenCalledOnce()
    })
  })

  describe('addSubject', () => {
    it('should add a new party to the table with ADDED action', () => {
      const { addSubject, tableState } = useManageParties(stateKey)

      addSubject(mockParty as any)

      expect(tableState.value).toHaveLength(1)
      expect(tableState.value[0]!.new.actions).toContain(ActionType.ADDED)
      expect(tableState.value[0]!.old).toBeUndefined()
    })

    it('should ignore undefined party', () => {
      const { addSubject, tableState } = useManageParties(stateKey)
      addSubject(undefined)
      expect(tableState.value).toHaveLength(0)
    })
  })

  describe('removeSubject', () => {
    it('should fully remove a row if it was a newly added party', () => {
      const { tableState, removeSubject } = useManageParties(stateKey)
      const newParty = { new: mockParty, old: undefined }
      tableState.value = [newParty]

      removeSubject(mockRow(0, newParty))

      expect(tableState.value).toHaveLength(0)
    })

    it('should add REMOVED action for existing party', () => {
      const { tableState, removeSubject } = useManageParties(stateKey)
      const existingParty = { new: mockParty, old: mockParty }
      tableState.value = [existingParty]

      removeSubject(mockRow(0, existingParty))

      expect(tableState.value).toHaveLength(1)
      expect(tableState.value[0]!.new.actions).toContain(ActionType.REMOVED)
    })
  })

  describe('undoSubject', () => {
    it('should revert "new" state to "old" state', () => {
      const { tableState, undoSubject } = useManageParties(stateKey)
      const oldVersion = { ...mockParty, email: 'original@example.com' }
      const currentVersion = {
        new: { ...mockParty, actions: [ActionType.EMAIL_CHANGED] },
        old: oldVersion
      }
      tableState.value = [currentVersion]

      undoSubject(mockRow(0, currentVersion))

      expect(tableState.value[0]!.new).toEqual(oldVersion)
    })

    it('should do nothing if old state is undefined', () => {
      const { tableState, undoSubject } = useManageParties(stateKey)
      const currentState = { new: mockParty, old: undefined }
      tableState.value = [currentState]

      undoSubject(mockRow(0, currentState))

      expect(tableState.value[0]).toEqual(currentState)
    })
  })

  describe('editSubject', () => {
    it('should keep the ADDED action if row has no old state', () => {
      const { tableState, editSubject } = useManageParties(stateKey)
      const newPartyRow = { new: mockParty, old: undefined }
      tableState.value = [newPartyRow]

      const editedParty = { ...mockParty, email: 'changed@example.com' }
      editSubject(editedParty as any, mockRow(0, newPartyRow))

      expect(tableState.value[0]!.new.actions).toEqual([ActionType.ADDED])
    })

    it('should add ADDRESS_CHANGED action if addresses are different', () => {
      const { tableState, editSubject } = useManageParties(stateKey)
      const existing = {
        new: mockParty,
        old: {
          ...mockParty,
          address: {
            ...mockParty.address,
            deliveryAddress: {
              ...mockParty.address.deliveryAddress,
              street: 'old street'
            },
            mailingAddress: {
              ...mockParty.address.deliveryAddress,
              street: 'new street'
            }
          }
        }
      }
      tableState.value = [existing]

      editSubject(mockParty as any, mockRow(0, existing))

      expect(tableState.value[0]!.new.actions).toEqual([ActionType.ADDRESS_CHANGED])
    })

    it('should add EMAIL_CHANGED action if email is different', () => {
      const { tableState, editSubject } = useManageParties(stateKey)
      const existing = {
        new: mockParty,
        old: { ...mockParty, email: 'old.email@example.com' }
      }
      tableState.value = [existing]

      editSubject(mockParty as any, mockRow(0, existing))

      expect(tableState.value[0]!.new.actions).toEqual([ActionType.EMAIL_CHANGED])
    })

    it('should add NAME_CHANGED and EMAIL_CHANGED actions when both are different', () => {
      const { tableState, editSubject } = useManageParties(stateKey)
      const existing = {
        new: mockParty,
        old: { ...mockParty, email: 'old.email@example.com', name: { ...mockParty.name, firstName: 'Old' } }
      }
      tableState.value = [existing] as any

      editSubject(mockParty as any, mockRow(0, existing))

      expect(tableState.value[0]!.new.actions).toEqual([ActionType.NAME_CHANGED, ActionType.EMAIL_CHANGED])
    })

    it('should update the edited row by id when it is not the first row', () => {
      const { tableState, editSubject } = useManageParties(stateKey)
      const other = { new: { ...mockParty, id: 'other' }, old: { ...mockParty, id: 'other' } }
      const existing = { new: mockParty, old: { ...mockParty, email: 'old.email@example.com' } }
      tableState.value = [other, existing] as any

      editSubject(mockParty as any, mockRow(0, existing))

      expect(tableState.value[0]!.new.actions).toEqual([])
      expect(tableState.value[1]!.new.actions).toEqual([ActionType.EMAIL_CHANGED])
    })

    it('should have no actions if edited data matches old state exactly', () => {
      const { tableState, editSubject } = useManageParties(stateKey)
      const existing = { new: mockParty, old: mockParty }
      tableState.value = [existing]

      editSubject(mockParty as any, mockRow(0, existing))

      expect(tableState.value[0]!.new.actions).toHaveLength(0)
    })
  })

  describe('cleanupFn', () => {
    it('should be called when removing a newly added party', () => {
      const cleanupFn = vi.fn()
      const { tableState, removeSubject } = useManageParties(stateKey, { cleanupFn })
      const newParty = { new: mockParty, old: undefined }
      tableState.value = [newParty] as any

      removeSubject(mockRow(0, newParty))

      expect(cleanupFn).toHaveBeenCalledOnce()
    })
  })
})
