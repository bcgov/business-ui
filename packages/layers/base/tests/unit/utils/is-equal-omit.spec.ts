import { describe, expect, it } from 'vitest'

describe('isEqualOmit', () => {
  it('should return true for equal objects', () => {
    const a = { id: 1, name: 'Court Order', type: 'filing' }
    const b = { id: 1, name: 'Court Order', type: 'filing' }

    expect(isEqualOmit(a, b, [])).toBe(true)
  })

  it('should return false for unequal objects', () => {
    const a = { id: 1, name: 'Court Order A' }
    const b = { id: 1, name: 'Court Order B' }

    expect(isEqualOmit(a, b, [])).toBe(false)
  })

  it('should return true for equal nested objects', () => {
    const a = { name: 'Test', meta: { details: { status: 'active' } } }
    const b = { name: 'Test', meta: { details: { status: 'active' } } }

    expect(isEqualOmit(a, b, [])).toBe(true)
  })

  it('should return false for unequal nested objects', () => {
    const a = { name: 'Test', meta: { details: { status: 'active' } } }
    const b = { name: 'Test', meta: { details: { status: 'inactive' } } }

    expect(isEqualOmit(a, b, [])).toBe(false)
  })

  it('should return true for two empty objects', () => {
    expect(isEqualOmit({}, {}, [])).toBe(true)
  })

  it('should return true for an empty object and an object where all keys are omitted', () => {
    expect(isEqualOmit({}, { id: '123', actions: ['ADDED'] }, ['id', 'actions'])).toBe(true)
  })

  it('should return false when comparing an empty object to a non-empty object', () => {
    expect(isEqualOmit({}, { name: 'Court Order' }, [])).toBe(false)
  })

  it('should return false when comparing an empty object to null or undefined', () => {
    // @ts-expect-error null !== object
    expect(isEqualOmit({}, null, [])).toBe(false)
    // @ts-expect-error undefined !== object
    expect(isEqualOmit({}, undefined, [])).toBe(false)
  })

  it('should ignore keys during equality check', () => {
    const sameName = { name: 'Order' }
    const a = { ...sameName, id: 'ID_1', isEditing: true, actions: ['ACTION_1'] }
    const b = { ...sameName, id: 'ID_2', isEditing: false, actions: ['ACTION_2'] }

    expect(isEqualOmit(a, b, ['id', 'isEditing', 'actions'])).toBe(true)
    expect(isEqualOmit(a, b, ['id', 'actions'])).toBe(false)
  })

  it('should return true if both args are null', () => {
    // @ts-expect-error test null args
    expect(isEqualOmit(null, null, ['id'])).toBe(true)
  })

  it('should return false if both args are undefined', () => {
    // @ts-expect-error undefined args
    expect(isEqualOmit(undefined, undefined, ['id'])).toBe(true)
  })

  it('should return false if one arg is null and the other is an object', () => {
    const obj = { id: 123, name: 'Test' }

    // @ts-expect-error test null arg
    expect(isEqualOmit(null, obj, ['id'])).toBe(false)
    // @ts-expect-error test null arg
    expect(isEqualOmit(obj, null, ['id'])).toBe(false)
  })

  it('should return false when comparing null and undefined', () => {
    // @ts-expect-error null/undefined args
    expect(isEqualOmit(null, undefined, ['id'])).toBe(false)
  })
})
