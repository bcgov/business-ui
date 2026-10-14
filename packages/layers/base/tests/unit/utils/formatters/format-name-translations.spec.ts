/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect } from 'vitest'

const mockOriginalTranslations: NameTranslation[] = [
  { id: '113', name: 'ABC LTD.' },
  { id: '114', name: 'FINANCIÈRE DE L’ODET' },
  { id: '115', name: 'SOCIÉTÉ GÉNÉRALE' }
]

describe('formatNameTranslationsSection', () => {
  describe('Without Draft Data (Initial Load)', () => {
    it('should format table state', () => {
      const result = formatNameTranslationsSection(mockOriginalTranslations, undefined)

      expect(result).toHaveLength(3)

      result.forEach((row, index) => {
        expect(row.old).toBeDefined()
        expect(row.new.actions).toEqual([])
        expect(row.old?.name).toBe(mockOriginalTranslations[index]!.name)
        expect(row.new.name).toBe(mockOriginalTranslations[index]!.name)
        expect(row.new.id).toBe(mockOriginalTranslations[index]!.id)
      })
    })

    it('should handle undefined or empty originalTranslations array safely', () => {
      const result = formatNameTranslationsSection(undefined, undefined)
      expect(result).toEqual([])
    })
  })

  describe('With Draft Data', () => {
    it('should mark unchanged name translations with empty actions array', () => {
      const draftTranslations: NameTranslation[] = [
        { id: '113', name: 'ABC LTD.' }
      ]

      const result = formatNameTranslationsSection(mockOriginalTranslations, draftTranslations)

      const row = result.find(r => r.old?.id === '113')
      expect(row?.new.actions).toEqual([])
      expect(row?.new.name).toBe('ABC LTD.')
    })

    it('should mark modified name translations with ActionType.CHANGED', () => {
      const draftTranslations: NameTranslation[] = [
        { id: '114', name: 'FINANCIÈRE DE L’ODET MODIFIED' }
      ]

      const result = formatNameTranslationsSection(mockOriginalTranslations, draftTranslations)

      const modifiedRow = result.find(r => r.old?.id === '114')
      expect(modifiedRow?.new.actions).toContain(ActionType.CHANGED)
      expect(modifiedRow?.new.name).toBe('FINANCIÈRE DE L’ODET MODIFIED')
      expect(modifiedRow?.old?.name).toBe('FINANCIÈRE DE L’ODET')
    })

    it('should mark omitted original items with ActionType.REMOVED', () => {
      const draftTranslations: NameTranslation[] = [
        { id: '113', name: 'ABC LTD.' },
        { id: '115', name: 'SOCIÉTÉ GÉNÉRALE' }
      ]

      const result = formatNameTranslationsSection(mockOriginalTranslations, draftTranslations)

      const removedRow = result.find(r => r.old?.id === '114')
      expect(removedRow?.new.actions).toContain(ActionType.REMOVED)
      expect(removedRow?.old).toBeDefined()
    })

    it('should mark newly added draft items with ActionType.ADDED and old = undefined', () => {
      const draftTranslations: NameTranslation[] = [
        ...mockOriginalTranslations,
        { id: 'client-uuid-999', name: 'BRAND NEW TRANSLATION' }
      ]

      const result = formatNameTranslationsSection(mockOriginalTranslations, draftTranslations)

      expect(result).toHaveLength(4)
      const addedRow = result.find(r => r.new.name === 'BRAND NEW TRANSLATION')

      expect(addedRow?.old).toBeUndefined()
      expect(addedRow?.new.actions).toContain(ActionType.ADDED)
    })

    it('should ignore NON_EDITABLE_FIELDS when evaluating ActionType.CHANGED', () => {
      const draftTranslations: NameTranslation[] = [
        { id: '113', name: 'ABC LTD.', isEditing: true } as any
      ]

      const result = formatNameTranslationsSection(mockOriginalTranslations, draftTranslations)

      const row = result.find(r => r.old?.id === '113')
      expect(row?.new.actions).toEqual([])
    })

    it('should place newly ADDED items first and preserve original item order', () => {
      const draftTranslations: NameTranslation[] = [
        { id: '113', name: 'ABC LTD.' },
        { id: 'client-uuid-1', name: 'NEW NAME 1' }
      ]

      const result = formatNameTranslationsSection(mockOriginalTranslations, draftTranslations)

      expect(result[0]!.new.name).toBe('NEW NAME 1')
      expect(result[0]!.new.actions).toContain(ActionType.ADDED)

      expect(result[1]!.old?.id).toBe('113')
      expect(result[2]!.old?.id).toBe('114')
      expect(result[3]!.old?.id).toBe('115')
    })

    it('should mark all original items as REMOVED if draftTranslations is an empty array', () => {
      const result = formatNameTranslationsSection(mockOriginalTranslations, [])

      expect(result).toHaveLength(3)
      result.forEach((row) => {
        expect(row.new.actions).toContain(ActionType.REMOVED)
      })
    })
  })
})

describe('formatNameTranslationsApi', () => {
  describe('No Changes', () => {
    it('should return undefined when no items have actions', () => {
      const tableState: TableBusinessState<NameTranslationSchema>[] = [
        {
          old: { id: '113', name: 'ABC LTD.', actions: [], isEditing: false },
          new: { id: '113', name: 'ABC LTD.', actions: [], isEditing: false }
        }
      ]

      const result = formatNameTranslationsApi(tableState)
      expect(result).toBeUndefined()
    })
  })

  describe('Has Changes', () => {
    it('should format updated items and include existing ID', () => {
      const tableState: TableBusinessState<NameTranslationSchema>[] = [
        {
          old: { id: '114', name: 'FINANCIÈRE DE L’ODET', actions: [], isEditing: false },
          new: { id: '114', name: 'FINANCIÈRE DE L’ODET MODIFIED', actions: [ActionType.CHANGED], isEditing: false }
        }
      ]

      const result = formatNameTranslationsApi(tableState)

      expect(result).toBeDefined()
      expect(result).toHaveLength(1)
      expect(result![0]).toEqual({
        id: '114',
        name: 'FINANCIÈRE DE L’ODET MODIFIED'
      })
    })

    it('should set id to undefined for newly added items (old === undefined)', () => {
      const tableState: TableBusinessState<NameTranslationSchema>[] = [
        {
          old: undefined,
          new: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'NEWLY ADDED TRANSLATION',
            actions: [ActionType.ADDED],
            isEditing: false
          }
        }
      ]

      const result = formatNameTranslationsApi(tableState)

      expect(result).toBeDefined()
      expect(result).toHaveLength(1)
      expect(result![0]).toEqual({
        id: undefined,
        name: 'NEWLY ADDED TRANSLATION'
      })
    })
  })

  describe('Removals', () => {
    it('should filter out items marked with ActionType.REMOVED', () => {
      const tableState: TableBusinessState<NameTranslationSchema>[] = [
        {
          old: { id: '113', name: 'REMOVED CORP', actions: [], isEditing: false },
          new: { id: '113', name: 'REMOVED CORP', actions: [ActionType.REMOVED], isEditing: false }
        },
        {
          old: { id: '114', name: 'RETAINED CORP', actions: [], isEditing: false },
          new: { id: '114', name: 'RETAINED CORP UPDATED', actions: [ActionType.CHANGED], isEditing: false }
        }
      ]

      const result = formatNameTranslationsApi(tableState)

      expect(result).toBeDefined()
      expect(result).toHaveLength(1)
      expect(result![0]).toEqual({
        id: '114',
        name: 'RETAINED CORP UPDATED'
      })
    })

    it('should return an empty array if all changed items are REMOVED', () => {
      const tableState: TableBusinessState<NameTranslationSchema>[] = [
        {
          old: { id: '113', name: 'REMOVED CORP 1', actions: [], isEditing: false },
          new: { id: '113', name: 'REMOVED CORP 1', actions: [ActionType.REMOVED], isEditing: false }
        },
        {
          old: { id: '114', name: 'REMOVED CORP 2', actions: [], isEditing: false },
          new: { id: '114', name: 'REMOVED CORP 2', actions: [ActionType.REMOVED], isEditing: false }
        },
        {
          old: { id: '115', name: 'REMOVED CORP 3', actions: [], isEditing: false },
          new: { id: '115', name: 'REMOVED CORP 3', actions: [ActionType.REMOVED], isEditing: false }
        }
      ]

      const result = formatNameTranslationsApi(tableState)
      expect(result).toEqual([])
    })
  })
})
