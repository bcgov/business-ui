/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import { describe, it, expect } from 'vitest'
import mockAmal from '#test-mocks/business-extended/json/amalgamationApplication/for-correction.json'

const mockOriginalData = mockAmal.amalgamation as Amalgamation

describe('formatAmalCorrectSection', () => {
  describe('Without Draft Data (Initial Load)', () => {
    it('should format tableState and statementState without draft state', () => {
      const { tableState, statementState } = formatAmalCorrectSection(mockOriginalData)

      expect(tableState).toHaveLength(3)

      tableState.forEach((row) => {
        expect(row.old).toBeDefined()
        expect(row.new.actions).toEqual([])
        expect(row.new).toEqual(row.old)
      })

      expect(tableState[0]!.new.id).toBe('662')
      expect(tableState[1]!.new.id).toBe('663')
      expect(tableState[2]!.new.id).toBe('664')

      expect(statementState.old?.courtApproval).toBe(false)
      expect(statementState.new.courtApproval).toBe(false)
      expect(statementState.new.actions).toEqual([])
    })

    it('should omit foreignJurisdiction from BC businesses during formatting', () => {
      const { tableState } = formatAmalCorrectSection(mockOriginalData)

      const bcBusiness = tableState.find(b => b.new.identifier === 'BC0888620')
      expect(bcBusiness?.new).not.toHaveProperty('foreignJurisdiction')

      const exBcBusiness = tableState.find(b => b.new.identifier === 'AL12345')
      expect(exBcBusiness?.new).toHaveProperty('foreignJurisdiction')
    })
  })

  describe('With Draft Data', () => {
    it('should preserve BC business state', () => {
      const draftData: Partial<Amalgamation> = {
        amalgamatingBusinesses: [
          {
            ...mockOriginalData.amalgamatingBusinesses[0]!, // BC business
            legalName: 'MODIFIED 0888620 B.C. LTD.'
          }
        ]
      }

      const { tableState } = formatAmalCorrectSection(mockOriginalData, draftData)

      const bcRow = tableState.find(r => r.new.identifier === 'BC0888620')
      expect(bcRow?.new.actions).toEqual([])
      expect(bcRow?.new.legalName).toBe(mockOriginalData.amalgamatingBusinesses[0]!.legalName)
    })

    it('should mark unchanged businesses with empty actions array', () => {
      const draftData: Partial<Amalgamation> = {
        amalgamatingBusinesses: [
          { ...mockOriginalData.amalgamatingBusinesses[0]! }
        ]
      }

      const { tableState } = formatAmalCorrectSection(mockOriginalData, draftData)

      const unchangedRow = tableState.find(r => r.new.identifier === 'BC0888620')
      expect(unchangedRow?.new.actions).toEqual([])
    })

    it('should mark modified ExBC businesses with ActionType.CHANGED', () => {
      const exBcOrig = mockOriginalData.amalgamatingBusinesses.find(b => !('legalType' in b))!
      const draftData: Partial<Amalgamation> = {
        amalgamatingBusinesses: [
          {
            ...exBcOrig,
            legalName: 'MODIFIED EXBC CORP'
          }
        ]
      }

      const { tableState } = formatAmalCorrectSection(mockOriginalData, draftData)

      const modifiedRow = tableState.find(r => r.new.identifier === exBcOrig.identifier)
      expect(modifiedRow?.new.actions).toContain(ActionType.CHANGED)
      expect(modifiedRow?.new.legalName).toBe('MODIFIED EXBC CORP')
    })

    it('should mark omitted original businesses with ActionType.REMOVED', () => {
      const draftData: Partial<Amalgamation> = {
        amalgamatingBusinesses: [
          mockOriginalData.amalgamatingBusinesses[0]!,
          mockOriginalData.amalgamatingBusinesses[1]!
        ]
      }

      const { tableState } = formatAmalCorrectSection(mockOriginalData, draftData)

      const removedRow = tableState.find(r => r.new.identifier === 'NB12345')
      expect(removedRow?.new.actions).toContain(ActionType.REMOVED)
      expect(removedRow?.old).toBeDefined()
    })

    it('should mark newly added draft businesses (no ID) with ActionType.ADDED', () => {
      const newDraftBusiness = {
        identifier: 'NEW9999',
        legalName: 'NEWLY ADDED CORP',
        role: 'amalgamating',
        foreignJurisdiction: { country: 'US', region: 'WA' }
      }

      const draftData: Partial<Amalgamation> = {
        amalgamatingBusinesses: [
          ...mockOriginalData.amalgamatingBusinesses,
          newDraftBusiness as any
        ]
      }

      const { tableState } = formatAmalCorrectSection(mockOriginalData, draftData)

      expect(tableState).toHaveLength(4)
      const addedRow = tableState.find(r => r.new.identifier === 'NEW9999')

      expect(addedRow?.old).toBeUndefined()
      expect(addedRow?.new.actions).toContain(ActionType.ADDED)
    })

    it('should update statementState with ActionType.CHANGED if courtApproval differs', () => {
      const draftData: Partial<Amalgamation> = {
        courtApproval: true
      }

      const { statementState } = formatAmalCorrectSection(mockOriginalData, draftData)

      expect(statementState.old?.courtApproval).toBe(false)
      expect(statementState.new.courtApproval).toBe(true)
      expect(statementState.new.actions).toContain(ActionType.CHANGED)
    })

    it('should ignore NON_EDITABLE_FIELDS when evaluating ActionType.CHANGED', () => {
      const draftData: Partial<Amalgamation> = {
        amalgamatingBusinesses: [
          {
            ...mockOriginalData.amalgamatingBusinesses[1]!,
            isEditing: true,
          } as any
        ]
      }

      const { tableState } = formatAmalCorrectSection(mockOriginalData, draftData)

      const row = tableState.find(r => r.new.identifier === 'BC0888620')
      expect(row?.new.actions).toEqual([])
    })

    it('should handle draftData being an empty object without crashing', () => {
      const { tableState, statementState } = formatAmalCorrectSection(mockOriginalData, {})

      expect(tableState).toHaveLength(3)
      tableState.forEach(row => expect(row.new.actions).toEqual([]))
      expect(statementState.new.actions).toEqual([])
    })

    it('should mark all original businesses as REMOVED if draft businesses array is empty', () => {
      const draftData: Partial<Amalgamation> = {
        amalgamatingBusinesses: []
      }

      const { tableState } = formatAmalCorrectSection(mockOriginalData, draftData)

      expect(tableState).toHaveLength(3)
      expect(tableState[0]!.new.actions).toEqual([])
      expect(tableState[1]!.new.actions).toEqual([ActionType.REMOVED])
      expect(tableState[2]!.new.actions).toEqual([ActionType.REMOVED])
    })
  })
})

describe('formatAmalCorrectApi', () => {
  const mockStatementState: TableBusinessState<AmalgamationCorrectStatementSchema> = {
    old: { courtApproval: false, actions: [], isEditing: false },
    new: { courtApproval: false, actions: [], isEditing: false }
  }

  describe('No Changes', () => {
    it('should return undefined when no changes have been made', () => {
      const tableState: TableBusinessState<AmalgamationTableRow>[] = [
        {
          old: { id: '662', identifier: 'BC0888620', legalName: 'BC CORP', role: 'amalgamating', actions: [], isEditing: false } as any,
          new: { id: '662', identifier: 'BC0888620', legalName: 'BC CORP', role: 'amalgamating', actions: [], isEditing: false } as any
        }
      ]

      const result = formatAmalCorrectApi(tableState, mockStatementState)
      expect(result).toBeUndefined()
    })
  })

  describe('Has Changes', () => {
    it('should format updated businesses', () => {
      const tableState: TableBusinessState<AmalgamationTableRow>[] = [
        {
          old: { id: '662', identifier: 'BC0888620', legalName: 'OLD NAME', foreignJurisdiction: { country: 'CA', region: 'NB' }, role: 'amalgamating', actions: [], isEditing: false } as any,
          new: { id: '662', identifier: 'BC0888620', legalName: 'NEW UPDATED NAME', foreignJurisdiction: { country: 'CA', region: 'NB' }, role: 'amalgamating', actions: [ActionType.CHANGED], isEditing: false } as any
        }
      ]

      const result = formatAmalCorrectApi(tableState, mockStatementState)

      expect(result).toBeDefined()
      expect(result?.amalgamatingBusinesses).toHaveLength(1)
      expect(result?.amalgamatingBusinesses[0]).toEqual({
        id: 662,
        identifier: 'BC0888620',
        legalName: 'NEW UPDATED NAME',
        role: 'amalgamating',
        foreignJurisdiction: { country: 'CA', region: 'NB' }
      })
      expect(result?.courtApproval).toEqual(false)
    })

    it('should format statement changes', () => {
      const tableState: TableBusinessState<AmalgamationTableRow>[] = [
        {
          old: { id: '662', identifier: 'BC0888620', actions: [], isEditing: false } as any,
          new: { id: '662', identifier: 'BC0888620', actions: [], isEditing: false } as any
        }
      ]

      const changedStatementState: TableBusinessState<AmalgamationCorrectStatementSchema> = {
        old: { courtApproval: false, actions: [], isEditing: false },
        new: { courtApproval: true, actions: [ActionType.CHANGED], isEditing: false }
      }

      const result = formatAmalCorrectApi(tableState, changedStatementState)

      expect(result).toBeDefined()
      expect(result?.courtApproval).toBe(true)
    })
  })

  describe('Remove', () => {
    it('should filter out ExBC businesses marked with ActionType.REMOVED', () => {
      const tableState: TableBusinessState<AmalgamationTableRow>[] = [
        {
          old: { id: '662', identifier: 'BC0888620', legalName: 'REMOVED CORP', actions: [], isEditing: false } as any,
          new: { id: '662', identifier: 'BC0888620', legalName: 'REMOVED CORP', actions: [ActionType.REMOVED], isEditing: false } as any
        },
        {
          old: { id: '663', identifier: 'AL12345', legalName: 'ALBANIA CORP', actions: [], isEditing: false } as any,
          new: { id: '663', identifier: 'AL12345', legalName: 'ALBANIA CORP', actions: [], isEditing: false } as any
        }
      ]

      const result = formatAmalCorrectApi(tableState, mockStatementState)

      expect(result?.amalgamatingBusinesses).toHaveLength(1)
      expect(result?.amalgamatingBusinesses[0]!.identifier).toBe('AL12345')
      expect(result?.amalgamatingBusinesses[0]!.id).toBe(663)
      expect(result?.courtApproval).toEqual(false)
    })
  })

  describe('Added', () => {
    it('should set id to undefined for newly added draft businesses (row.old === undefined)', () => {
      const tableState: TableBusinessState<AmalgamationTableRow>[] = [
        {
          old: undefined,
          new: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            identifier: 'NEW9999',
            legalName: 'NEWLY ADDED CORP',
            role: 'amalgamating',
            foreignJurisdiction: {
              country: 'CA',
              region: 'NB'
            },
            actions: [ActionType.ADDED],
            isEditing: false
          } as any
        }
      ]

      const result = formatAmalCorrectApi(tableState, mockStatementState)

      expect(result).toBeDefined()
      expect(result?.amalgamatingBusinesses).toHaveLength(1)
      expect(result?.amalgamatingBusinesses[0]).toEqual({
        id: undefined,
        identifier: 'NEW9999',
        legalName: 'NEWLY ADDED CORP',
        role: 'amalgamating',
        foreignJurisdiction: { country: 'CA', region: 'NB' }
      })
    })
  })
})
