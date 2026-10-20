/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('useManageNameTranslations', () => {
  const stateKey = 'manage-name-translations-test'

  const mockRow = (original: any) => ({
    original
  }) as any

  const existingNameTranslation = {
    id: '100',
    isEditing: false,
    name: 'Nom Entreprise',
    actions: []
  }

  const draftNameTranslation = {
    id: '200',
    isEditing: false,
    name: 'Raison Sociale',
    actions: []
  }

  beforeEach(() => {
    const { tableState } = useManageNameTranslations(stateKey)
    tableState.value = []
  })

  describe('Initial State', () => {
    it('should initialize with an empty table', () => {
      const { tableState } = useManageNameTranslations(stateKey)
      expect(tableState.value).toEqual([])
    })
  })

  describe('hasChanges', () => {
    it('should return false when tableState has no items or no actions', () => {
      const { tableState, hasChanges } = useManageNameTranslations(stateKey)

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
      const { tableState, hasChanges } = useManageNameTranslations(stateKey)

      tableState.value = [
        {
          old: { id: '1', actions: [] },
          new: { id: '1', actions: [ActionType.CHANGED] }
        }
      ] as any

      expect(hasChanges.value).toBe(true)
    })
  })

  describe('updateTable', () => {
    it('should deep clone inserted state', () => {
      const { updateTable, tableState } = useManageNameTranslations(stateKey)
      const localObj = { ...draftNameTranslation }
      const newState = { new: localObj as any, old: undefined }

      updateTable(newState)
      localObj.name = 'Mutated Name'

      expect(tableState.value[0]!.new.name).toBe('Raison Sociale')
      expect(tableState.value[0]).not.toBe(newState)
    })

    it('should replace the row with the matching new.id', () => {
      const { updateTable, tableState } = useManageNameTranslations(stateKey)
      tableState.value = [
        { new: { ...existingNameTranslation }, old: { ...existingNameTranslation } },
        { new: { ...draftNameTranslation }, old: undefined }
      ] as any

      updateTable({
        new: { ...draftNameTranslation, name: 'Raison Modifiee', actions: [ActionType.ADDED] },
        old: undefined
      } as any)

      expect(tableState.value).toHaveLength(2)
      expect(tableState.value[0]!.new.name).toBe('Nom Entreprise')
      expect(tableState.value[1]!.new.name).toBe('Raison Modifiee')
    })

    it('should append a row when no row matches new.id', () => {
      const { updateTable, tableState } = useManageNameTranslations(stateKey)
      tableState.value = [
        { new: { ...existingNameTranslation }, old: { ...existingNameTranslation } }
      ] as any

      updateTable({ new: { ...draftNameTranslation }, old: undefined } as any)

      expect(tableState.value.map(row => row.new.id)).toEqual(['100', '200'])
    })

    it('should call the cleanup function', () => {
      const cleanupFn = vi.fn()
      const { updateTable } = useManageNameTranslations(stateKey, { cleanupFn })

      updateTable({ new: { ...draftNameTranslation }, old: undefined } as any)

      expect(cleanupFn).toHaveBeenCalledOnce()
    })
  })

  describe('addSubject', () => {
    it('should ignore undefined input', () => {
      const cleanupFn = vi.fn()
      const { addSubject, tableState } = useManageNameTranslations(stateKey, { cleanupFn })

      addSubject(undefined)

      expect(tableState.value).toHaveLength(0)
      expect(cleanupFn).not.toHaveBeenCalled()
    })

    it('should add the subject with the ADDED action', () => {
      const { addSubject, tableState } = useManageNameTranslations(stateKey)

      addSubject({ ...draftNameTranslation })

      expect(tableState.value[0]!.new.actions).toEqual([ActionType.ADDED])
      expect(tableState.value[0]!.old).toBeUndefined()
    })
  })

  describe('removeSubject', () => {
    it('should remove newly added row entirely', () => {
      const cleanupFn = vi.fn()
      const { removeSubject, tableState } = useManageNameTranslations(stateKey, { cleanupFn })
      const existing = { new: { ...existingNameTranslation }, old: { ...existingNameTranslation } }
      const added = { new: { ...draftNameTranslation, actions: [ActionType.ADDED] }, old: undefined }
      tableState.value = [added, existing] as any

      removeSubject(mockRow(added))

      expect(tableState.value.map(row => row.new.id)).toEqual(['100'])
      expect(cleanupFn).toHaveBeenCalledOnce()
    })

    it('should set REMOVED action for existing row', () => {
      const cleanupFn = vi.fn()
      const { removeSubject, tableState } = useManageNameTranslations(stateKey, { cleanupFn })
      const existing = { new: { ...existingNameTranslation }, old: { ...existingNameTranslation } }
      tableState.value = [existing] as any

      removeSubject(mockRow(existing))

      expect(tableState.value).toHaveLength(1)
      expect(tableState.value[0]!.new.actions).toEqual([ActionType.REMOVED])
      expect(cleanupFn).toHaveBeenCalledOnce()
    })
  })

  describe('undoSubject', () => {
    it('should revert new to old state when old exists', () => {
      const { undoSubject, tableState } = useManageNameTranslations(stateKey)
      const existing = {
        new: { ...existingNameTranslation, name: 'Changed Name', actions: [ActionType.CORRECTED] },
        old: { ...existingNameTranslation }
      }
      tableState.value = [existing] as any

      undoSubject(mockRow(existing))

      expect(tableState.value[0]!.new).toEqual(existing.old)
      expect(tableState.value[0]!.new).not.toBe(tableState.value[0]!.old)
    })

    it('should do nothing when old is undefined', () => {
      const cleanupFn = vi.fn()
      const { undoSubject, tableState } = useManageNameTranslations(stateKey, { cleanupFn })
      const draft = { new: { ...draftNameTranslation, actions: [ActionType.ADDED] }, old: undefined }
      tableState.value = [draft] as any

      undoSubject(mockRow(draft))

      expect(tableState.value[0]).toEqual(draft)
      expect(cleanupFn).not.toHaveBeenCalled()
    })
  })

  describe('editSubject', () => {
    it('should preserve ADDED for draft-only rows', () => {
      const { editSubject, tableState } = useManageNameTranslations(stateKey)
      const draft = { new: { ...draftNameTranslation, actions: [ActionType.ADDED] }, old: undefined }
      tableState.value = [draft] as any

      editSubject({ ...draftNameTranslation, name: 'Raison Sociale Modifiee' }, mockRow(draft))

      expect(tableState.value[0]!.new.actions).toEqual([ActionType.ADDED])
      expect(tableState.value[0]!.new.name).toBe('Raison Sociale Modifiee')
    })

    it('should set CORRECTED when existing name changes', () => {
      const cleanupFn = vi.fn()
      const { editSubject, tableState } = useManageNameTranslations(stateKey, { cleanupFn })
      const existing = { new: { ...existingNameTranslation }, old: { ...existingNameTranslation } }
      tableState.value = [existing] as any

      editSubject({ ...existingNameTranslation, name: 'Nom Corrige' }, mockRow(existing))

      expect(tableState.value[0]!.new.actions).toEqual([ActionType.CORRECTED])
      expect(tableState.value[0]!.new.name).toBe('Nom Corrige')
      expect(cleanupFn).toHaveBeenCalledOnce()
    })

    it('should clear actions when existing name is unchanged', () => {
      const { editSubject, tableState } = useManageNameTranslations(stateKey)
      const existing = { new: { ...existingNameTranslation }, old: { ...existingNameTranslation } }
      tableState.value = [existing] as any

      editSubject({ ...existingNameTranslation }, mockRow(existing))

      expect(tableState.value[0]!.new.actions).toEqual([])
    })

    it('should ignore non-editable fields when comparing', () => {
      const { editSubject, tableState } = useManageNameTranslations(stateKey)
      const existing = { new: { ...existingNameTranslation }, old: { ...existingNameTranslation } }
      tableState.value = [existing] as any

      editSubject(
        { ...existingNameTranslation, isEditing: true, actions: [ActionType.CORRECTED] },
        mockRow(existing)
      )

      expect(tableState.value[0]!.new.actions).toEqual([])
    })

    it('should ignore undefined name translation', () => {
      const cleanupFn = vi.fn()
      const { editSubject, tableState } = useManageNameTranslations(stateKey, { cleanupFn })
      const existing = { new: { ...existingNameTranslation }, old: { ...existingNameTranslation } }
      tableState.value = [existing] as any

      editSubject(undefined, mockRow(existing))

      expect(tableState.value[0]!.new.name).toBe('Nom Entreprise')
      expect(tableState.value[0]!.new.actions).toEqual([])
      expect(cleanupFn).not.toHaveBeenCalled()
    })
  })
})
