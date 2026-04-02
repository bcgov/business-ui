/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from 'vitest'

describe('useManageNameTranslations', () => {
  const stateKey = 'manage-name-translations-test'

  const mockRow = (index: number, original: any) => ({
    index,
    original
  }) as any

  const existingNameTranslation = {
    id: '100',
    name: 'Nom Entreprise',
    actions: []
  }

  const draftNameTranslation = {
    id: '200',
    name: 'Raison Sociale',
    actions: []
  }

  beforeEach(() => {
    const { tableState, addingNameTranslation, expandedState } = useManageNameTranslations(stateKey)
    tableState.value = []
    addingNameTranslation.value = false
    expandedState.value = undefined
  })

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const { tableState, addingNameTranslation, expandedState } = useManageNameTranslations(stateKey)
      expect(tableState.value).toEqual([])
      expect(addingNameTranslation.value).toBe(false)
      expect(expandedState.value).toBeUndefined()
    })
  })

  describe('addNewNameTranslation', () => {
    it('should ignore undefined input', () => {
      const { addNewNameTranslation, tableState } = useManageNameTranslations(stateKey)
      addNewNameTranslation(undefined as any)
      expect(tableState.value).toHaveLength(0)
    })

    it('should prepend newest added rows before older added and existing rows', () => {
      const { addNewNameTranslation, tableState } = useManageNameTranslations(stateKey)

      tableState.value = [
        { new: { ...existingNameTranslation }, old: { ...existingNameTranslation } },
        { new: { ...draftNameTranslation, actions: [ActionType.ADDED] }, old: undefined }
      ] as any

      addNewNameTranslation({ name: 'Nouveau Nom' } as any)

      expect(tableState.value).toHaveLength(3)
      expect(tableState.value[0]!.new.id).toBeUndefined()
      expect(tableState.value[0]!.new.actions).toEqual([ActionType.ADDED])
      expect(tableState.value[1]!.new.id).toBe('200')
      expect(tableState.value[2]!.new.id).toBe('100')
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

    it('should replace state by row index when row is provided', () => {
      const { updateTable, tableState } = useManageNameTranslations(stateKey)
      tableState.value = [
        { new: { ...existingNameTranslation }, old: { ...existingNameTranslation } },
        { new: { ...draftNameTranslation }, old: undefined }
      ] as any

      const updated = {
        new: { ...existingNameTranslation, name: 'Entreprise Modifiee', actions: [ActionType.CORRECTED] },
        old: { ...existingNameTranslation }
      }

      updateTable(updated as any, mockRow(0, tableState.value[0]))

      expect(tableState.value[0]!.new.name).toBe('Entreprise Modifiee')
      expect(tableState.value[1]!.new.name).toBe('Raison Sociale')
    })
  })

  describe('removeNameTranslation', () => {
    it('should remove newly added row entirely', () => {
      const { removeNameTranslation, tableState } = useManageNameTranslations(stateKey)
      const added = {
        new: { ...draftNameTranslation, actions: [ActionType.ADDED] },
        old: undefined
      }
      tableState.value = [added] as any

      removeNameTranslation(mockRow(0, added))

      expect(tableState.value).toHaveLength(0)
    })

    it('should set REMOVED action for existing row', () => {
      const { removeNameTranslation, tableState } = useManageNameTranslations(stateKey)
      const existing = {
        new: { ...existingNameTranslation },
        old: { ...existingNameTranslation }
      }
      tableState.value = [existing] as any

      removeNameTranslation(mockRow(0, existing))

      expect(tableState.value).toHaveLength(1)
      expect(tableState.value[0]!.new.actions).toEqual([ActionType.REMOVED])
    })
  })

  describe('undoNameTranslation', () => {
    it('should revert new to old state when old exists', () => {
      const { undoNameTranslation, tableState } = useManageNameTranslations(stateKey)
      const existing = {
        new: { ...existingNameTranslation, name: 'Changed Name', actions: [ActionType.CORRECTED] },
        old: { ...existingNameTranslation }
      }
      tableState.value = [existing] as any

      undoNameTranslation(mockRow(0, existing))

      expect(tableState.value[0]!.new).toEqual(existing.old)
    })

    it('should do nothing when old is undefined', () => {
      const { undoNameTranslation, tableState } = useManageNameTranslations(stateKey)
      const draft = {
        new: { ...draftNameTranslation, actions: [ActionType.ADDED] },
        old: undefined
      }
      tableState.value = [draft] as any

      undoNameTranslation(mockRow(0, draft))

      expect(tableState.value[0]).toEqual(draft)
    })
  })

  describe('applyTableEdits', () => {
    it('should preserve ADDED for draft-only rows', () => {
      const { applyTableEdits, tableState } = useManageNameTranslations(stateKey)
      const draft = {
        new: { ...draftNameTranslation, actions: [ActionType.ADDED] },
        old: undefined
      }
      tableState.value = [draft] as any

      applyTableEdits(
        { ...draftNameTranslation, name: 'Raison Sociale Modifiee' } as any,
        mockRow(0, draft)
      )

      expect(tableState.value[0]!.new.actions).toEqual([ActionType.ADDED])
    })

    it('should set CORRECTED when existing name changes', () => {
      const { applyTableEdits, tableState } = useManageNameTranslations(stateKey)
      const existing = {
        new: { ...existingNameTranslation },
        old: { ...existingNameTranslation }
      }
      tableState.value = [existing] as any

      applyTableEdits(
        { ...existingNameTranslation, name: 'Nom Corrige' } as any,
        mockRow(0, existing)
      )

      expect(tableState.value[0]!.new.actions).toEqual([ActionType.CORRECTED])
      expect(tableState.value[0]!.new.name).toBe('Nom Corrige')
    })

    it('should clear actions when existing name is unchanged', () => {
      const { applyTableEdits, tableState } = useManageNameTranslations(stateKey)
      const existing = {
        new: { ...existingNameTranslation },
        old: { ...existingNameTranslation }
      }
      tableState.value = [existing] as any

      applyTableEdits(
        { ...existingNameTranslation } as any,
        mockRow(0, existing)
      )

      expect(tableState.value[0]!.new.actions).toEqual([])
    })

    it('should ignore undefined name translation', () => {
      const { applyTableEdits, tableState } = useManageNameTranslations(stateKey)
      const existing = {
        new: { ...existingNameTranslation },
        old: { ...existingNameTranslation }
      }
      tableState.value = [existing] as any

      applyTableEdits(undefined as any, mockRow(0, existing))

      expect(tableState.value[0]!.new.name).toBe('Nom Entreprise')
      expect(tableState.value[0]!.new.actions).toEqual([])
    })
  })
})
