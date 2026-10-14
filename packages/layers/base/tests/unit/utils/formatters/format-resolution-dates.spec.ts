import { describe, it, expect } from 'vitest'

describe('formatResolutionDatesApi', () => {
  it('should return undefined when given an empty array', () => {
    const result = formatResolutionDatesApi([])

    expect(result).toBeUndefined()
  })

  it('should filter out items with REMOVED action', () => {
    const mockData = [
      {
        old: { id: '1', type: 'SPECIAL', date: '2026-01-01', actions: [], isEditing: false },
        new: { id: '1', type: 'SPECIAL', date: '2026-01-01', actions: [ActionType.REMOVED], isEditing: false }
      }
    ]

    const result = formatResolutionDatesApi(mockData)

    expect(result).toBeUndefined()
  })

  it('should map table state to API format', () => {
    const mockData = [
      {
        old: { id: '42', type: 'SPECIAL', date: '2026-05-10', actions: [], isEditing: false },
        new: { id: '42', type: 'SPECIAL', date: '2026-05-12', actions: [ActionType.CHANGED], isEditing: false }
      }
    ]

    const result = formatResolutionDatesApi(mockData)

    expect(result).toHaveLength(1)
    expect(result![0]!.id).toBe(42)
    expect(result![0]!.type).toBe('SPECIAL')
    expect(result![0]!.date).toBe('2026-05-12')
  })

  it('should set id to undefined for a newly added date', () => {
    const mockData = [
      {
        old: undefined,
        new: { id: '99', date: '2026-06-01', actions: [ActionType.ADDED], isEditing: false }
      }
    ]

    const result = formatResolutionDatesApi(mockData)

    expect(result![0]!.id).toBeUndefined()
    expect(result![0]!.date).toBe('2026-06-01')
  })

  it('should filter removed dates', () => {
    const mockData = [
      {
        old: { id: '1', type: 'A', date: '2026-01-01', actions: [], isEditing: false },
        new: { id: '1', type: 'A', date: '2026-01-01', actions: [], isEditing: false }
      },
      {
        old: { id: '2', type: 'B', date: '2026-02-01', actions: [], isEditing: false },
        new: { id: '2', type: 'B', date: '2026-02-02', actions: [ActionType.CHANGED], isEditing: false }
      },
      {
        old: { id: '3', type: 'C', date: '2026-03-01', actions: [], isEditing: false },
        new: { id: '3', type: 'C', date: '2026-03-01', actions: [ActionType.REMOVED], isEditing: false }
      }
    ]

    const result = formatResolutionDatesApi(mockData)

    expect(result).toHaveLength(2)
    expect(result![0]!.id).toBe(1)
    expect(result![1]!.id).toBe(2)
  })
})

describe('formatResolutionDatesSection', () => {
  it('should handle empty original and draft dates', () => {
    const { newState, tableState } = formatResolutionDatesSection([])

    expect(tableState).toHaveLength(0)
    expect(newState).toBeDefined()
  })

  it('should add ADDED action to newState when draft item has no id', () => {
    const draftDates = [{ id: undefined, type: 'NEW_TYPE', date: '2026-07-01' }]

    const { newState } = formatResolutionDatesSection([], draftDates)

    expect(newState.type).toBe('NEW_TYPE')
    expect(newState.date).toBe('2026-07-01')
    expect(newState.actions).toEqual([ActionType.ADDED])
  })

  it('should add REMOVED action if original date is missing in draftDates', () => {
    const originalDates = [{ id: 10, type: 'TYPE_A', date: '2026-01-01' }]

    const { tableState } = formatResolutionDatesSection(originalDates, [])

    expect(tableState).toHaveLength(1)
    expect(tableState[0]!).toHaveProperty('old')
    expect(tableState[0]!).toHaveProperty('new')

    expect(tableState[0]!.old!.id).toBe('10')
    expect(tableState[0]!.new.actions).toEqual([ActionType.REMOVED])
  })

  it('should add CHANGED action when draft date differs from original date', () => {
    const originalDates = [{ id: 10, type: 'TYPE_A', date: '2026-01-01' }]
    const draftDates = [{ id: 10, type: 'TYPE_A', date: '2026-01-05' }]

    const { tableState } = formatResolutionDatesSection(originalDates, draftDates)

    expect(tableState[0]!.new.date).toBe('2026-01-05')
    expect(tableState[0]!.new.actions).toEqual([ActionType.CHANGED])
  })

  it('should keep actions empty when draft date matches original date', () => {
    const originalDates = [{ id: 10, type: 'TYPE_A', date: '2026-01-01' }]
    const draftDates = [{ id: 10, type: 'TYPE_A', date: '2026-01-01' }]

    const { tableState } = formatResolutionDatesSection(originalDates, draftDates)

    expect(tableState[0]!.new.date).toBe('2026-01-01')
    expect(tableState[0]!.new.actions).toEqual([])
  })

  it('should not modify original dates when draftDates is undefined', () => {
    const originalDates = [{ id: 10, type: 'TYPE_A', date: '2026-01-01' }]

    const { tableState } = formatResolutionDatesSection(originalDates, undefined)

    expect(tableState).toHaveLength(1)
    expect(tableState[0]!.old).toEqual(tableState[0]!.new)
    expect(tableState[0]!.new.actions).toEqual([])
  })
})
