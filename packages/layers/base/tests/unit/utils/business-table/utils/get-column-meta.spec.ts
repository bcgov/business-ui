import { describe, it, expect } from 'vitest'

describe('getColumnMeta', () => {
  it('should return an empty object if no option provided', () => {
    const result = getColumnMeta()

    expect(result).toEqual({})
  })

  it('should return an empty object for the "default" option', () => {
    const result = getColumnMeta('default')

    expect(result).toEqual({})
  })

  it('should return correct config for the "first" option', () => {
    const expected = {
      class: {
        th: 'pl-6',
        td: 'pr-2 py-4 pl-6'
      }
    }

    const result = getColumnMeta('first')

    expect(result).toEqual(expected)
  })

  it('should return correct config for the "last" option', () => {
    const expected = {
      class: {
        th: 'pr-6',
        td: 'pl-2 py-4 pr-6'
      }
    }

    const result = getColumnMeta('last')

    expect(result).toEqual(expected)
  })
})
