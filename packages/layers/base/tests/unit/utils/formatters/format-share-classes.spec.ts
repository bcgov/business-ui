// @vitest-environment node
import { describe, it, expect } from 'vitest'

const baseData: ShareClass[] = [
  {
    id: 1,
    name: 'Class A Shares',
    priority: 1,
    hasMaximumShares: false,
    maxNumberOfShares: null,
    hasRightsOrRestrictions: true,
    hasParValue: false,
    parValue: null,
    currency: 'CAD',
    currencyAdditional: null,
    series: [
      {
        id: 101,
        name: 'Series 1 Shares',
        priority: 1,
        hasMaximumShares: true,
        maxNumberOfShares: 500,
        hasRightsOrRestrictions: false
      }
    ]
  },
  {
    id: 2,
    name: 'Class B Shares',
    priority: 2,
    hasMaximumShares: true,
    maxNumberOfShares: 1000,
    hasRightsOrRestrictions: false,
    hasParValue: true,
    parValue: 1.5,
    currency: 'USD',
    currencyAdditional: null,
    series: []
  }
]

describe('formatShareClassesSection', () => {
  it('should format data into old/new state when draftClasses is undefined', () => {
    const result = formatShareClassesSection(baseData, undefined)

    expect(result).toHaveLength(2)
    expect(result[0]!.old).toBeDefined()
    expect(result[0]!.new).toEqual(result[0]!.old)

    // Removes 'shares' in name converts IDs to string
    expect(result[0]!.new.name).toBe('Class A')
    expect(result[0]!.new.id).toBe('1')
    expect(result[0]!.new.series[0]!.name).toBe('Series 1')
    expect(result[0]!.new.series[0]!.id).toBe('101')
    expect(result[0]!.new.actions).toEqual([])
  })

  it('should add REMOVED badge when present in original but missing in draft', () => {
    const draftData: ShareClass[] = [baseData[0]!]

    const result = formatShareClassesSection(baseData, draftData)

    expect(result).toHaveLength(2)
    const classBRow = result.find(r => r.old?.id === '2')

    expect(classBRow).toBeDefined()
    expect(classBRow!.new.actions).toEqual([ActionType.REMOVED])
  })

  it('should add ADDED badge when present in draft but missing in original', () => {
    const draftData: ShareClass[] = [
      ...baseData,
      {
        name: 'Class C Shares',
        priority: 3,
        hasMaximumShares: false,
        maxNumberOfShares: null,
        hasRightsOrRestrictions: false,
        hasParValue: false,
        parValue: null,
        currency: null,
        currencyAdditional: null,
        series: []
      }
    ]

    const result = formatShareClassesSection(baseData, draftData)

    expect(result).toHaveLength(3)
    const addedRow = result.find(r => r.old === undefined)

    expect(addedRow).toBeDefined()
    expect(addedRow!.new.name).toBe('Class C')
    expect(addedRow!.new.actions).toEqual([ActionType.ADDED])
    expect(typeof addedRow!.new.id).toBe('string') // added uuid
  })

  it('should add CHANGED badge on class if class different', () => {
    const draftData: ShareClass[] = [
      {
        ...baseData[0]!,
        name: 'Class A Modified Shares'
      },
      baseData[1]!
    ]

    const result = formatShareClassesSection(baseData, draftData)

    expect(result[0]!.new.actions).toEqual([ActionType.CHANGED])
    expect(result[0]!.new.name).toBe('Class A Modified')
    expect(result[1]!.new.actions).toEqual([])
  })

  it('should add CHANGED badge to series when series is edited', () => {
    const draftData: ShareClass[] = [
      {
        ...baseData[0]!,
        series: [
          {
            ...baseData[0]!.series[0]!,
            name: 'Series 1 Modified'
          }
        ]
      },
      baseData[1]!
    ]

    const result = formatShareClassesSection(baseData, draftData)

    expect(result[0]!.new.series[0]!.actions).toEqual([ActionType.CHANGED])
    expect(result[0]!.new.actions).toEqual([]) // class does not get action when a series is edited
  })

  it('should normalize priority', () => {
    const draftData: ShareClass[] = [
      {
        ...baseData[1]!,
        priority: 1
      },
      {
        id: 3,
        name: 'Class C Shares',
        priority: 2,
        hasMaximumShares: false,
        maxNumberOfShares: null,
        hasRightsOrRestrictions: false,
        hasParValue: false,
        parValue: null,
        currency: null,
        currencyAdditional: null,
        series: []
      }
    ]

    const result = formatShareClassesSection(baseData, draftData)

    expect(result).toHaveLength(3)
    expect(result[0]!.new.actions).toEqual([ActionType.REMOVED])
    expect(result[0]!.new.priority).toBe(1)

    expect(result[1]!.new.id).toBe('2')
    expect(result[1]!.new.priority).toBe(2)

    expect(result[2]!.new.id).toBe('3')
    expect(result[2]!.new.priority).toBe(3)
  })
})

describe('formatShareClassesApi', () => {
  it('should map table state to API schema', () => {
    const tableState: TableBusinessState<ShareClassSchema>[] = [
      {
        old: baseData[0] as unknown as ShareClassSchema,
        new: {
          id: '1',
          name: 'Class A',
          priority: 1,
          hasMaximumShares: false,
          maxNumberOfShares: null,
          hasRightsOrRestrictions: true,
          hasParValue: false,
          parValue: null,
          currency: 'CAD',
          currencyAdditional: undefined,
          actions: [],
          isEditing: false,
          series: [
            {
              id: '101',
              name: 'Series 1',
              priority: 1,
              hasMaximumShares: true,
              maxNumberOfShares: 500,
              hasRightsOrRestrictions: false,
              actions: [ActionType.CHANGED],
              isEditing: false,
              isInvalid: false
            }
          ]
        }
      },
      {
        old: baseData[1] as unknown as ShareClassSchema,
        new: {
          id: '2',
          name: 'Class B',
          priority: 2,
          hasMaximumShares: true,
          maxNumberOfShares: 1000,
          hasRightsOrRestrictions: false,
          hasParValue: true,
          parValue: 1.5,
          currency: undefined,
          currencyAdditional: undefined,
          actions: [ActionType.REMOVED],
          isEditing: false,
          series: []
        }
      }
    ]

    const apiPayload = formatShareClassesApi(tableState)

    // filters removed
    expect(apiPayload).toHaveLength(1)

    expect(apiPayload[0]!.name).toBe('Class A Shares')
    expect(apiPayload[0]!.series[0]!.name).toBe('Series 1 Shares')

    // converts id back to number for existing rows
    expect(apiPayload[0]!.id).toBe(1)
    expect(apiPayload[0]!.series[0]!.id).toBe(101)

    expect(apiPayload[0]!.priority).toBe(1)
    expect(apiPayload[0]!.series[0]!.priority).toBe(1)

    expect(apiPayload[0]).not.toHaveProperty('actions')
    expect(apiPayload[0]).not.toHaveProperty('isEditing')
  })

  it('should omit id for newly added classes and series', () => {
    const tableState: TableBusinessState<ShareClassSchema>[] = [
      {
        old: undefined,
        new: {
          id: 'random-uuid-1234',
          name: 'Class New',
          priority: 1,
          hasMaximumShares: false,
          maxNumberOfShares: null,
          hasRightsOrRestrictions: false,
          hasParValue: false,
          parValue: null,
          currency: undefined,
          currencyAdditional: undefined,
          actions: [ActionType.ADDED],
          isEditing: false,
          series: [
            {
              id: 'random-uuid-5678',
              name: 'Series New',
              priority: 1,
              hasMaximumShares: false,
              maxNumberOfShares: null,
              hasRightsOrRestrictions: false,
              actions: [ActionType.ADDED],
              isEditing: false,
              isInvalid: false
            }
          ]
        }
      }
    ]

    const apiPayload = formatShareClassesApi(tableState)

    expect(apiPayload[0]!.id).toBeUndefined()
    expect(apiPayload[0]!.series[0]!.id).toBeUndefined()
  })
})
