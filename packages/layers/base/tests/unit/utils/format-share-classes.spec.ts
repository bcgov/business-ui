import { describe, it, expect } from 'vitest'

describe('formatShareClassesUi', () => {
  it('should map api response type to table shape', () => {
    const mockData = [
      {
        id: 1,
        name: 'Class A Shares',
        currency: 'CAD',
        series: [
          { id: 101, name: 'Series A value' }
        ]
      }
    ]

    const result = formatShareClassesUi(mockData as ShareClass[])

    expect(result).toHaveLength(1)
    expect(result[0]).toHaveProperty('new')
    expect(result[0]).toHaveProperty('old')

    expect(result[0]!.new.name).toBe('Class A')
    expect(result[0]!.new.series[0]!.name).toBe('Series A')

    expect(result[0]!.new.id).toBe('1')
    expect(result[0]!.new.series[0]!.id).toBe('101')
  })

  it('should convert null currency to undefined', () => {
    const mockData = [{ id: 1, name: 'Test', currency: null, series: [] }] as unknown as ShareClass[]
    const result = formatShareClassesUi(mockData)

    expect(result[0]!.new.currency).toBeUndefined()
  })

  it('should not mutate old series when new series is changed', () => {
    const mock = [{ id: 1, name: 'Class A', series: [{ id: 10, name: 'S1' }] }] as unknown as ShareClass[]
    const result = formatShareClassesUi(mock)

    result[0]!.new.series[0]!.name = 'CHANGED'

    expect(result[0]!.old!.series[0]!.name).toBe('S1')
  })

  it('should have new and old be equal', () => {
    const mockData = [{ id: 1, name: 'Test', series: [] }] as unknown as ShareClass[]
    const result = formatShareClassesUi(mockData)

    expect(result[0]!.new).toEqual(result[0]!.old)
    expect(result[0]!.old).toBeDefined()
  })
})
