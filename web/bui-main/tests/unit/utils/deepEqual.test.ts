import { describe, expect, it } from 'vitest'
import { deepEqual } from '~/utils/deepEqual'

describe('deepEqual', () => {
  it('should return true for identical objects', () => {
    const obj1 = { a: 1, b: 2, c: 3 }
    const obj2 = { a: 1, b: 2, c: 3 }
    expect(deepEqual(obj1, obj2)).toBe(true)
  })

  it('should return false for different objects', () => {
    const obj1 = { a: 1, b: 2, c: 3 }
    const obj2 = { a: 1, b: 2, c: 4 }
    expect(deepEqual(obj1, obj2)).toBe(false)
  })

  it('should return true for deeply equal objects', () => {
    const obj1 = { a: { b: { c: 1 } } }
    const obj2 = { a: { b: { c: 1 } } }
    expect(deepEqual(obj1, obj2)).toBe(true)
  })

  it('should return false for deeply unequal objects', () => {
    const obj1 = { a: { b: { c: 1 } } }
    const obj2 = { a: { b: { c: 2 } } }
    expect(deepEqual(obj1, obj2)).toBe(false)
  })

  it('should return true when ignoring specified keys', () => {
    const obj1 = { a: 1, b: 2, c: 3 }
    const obj2 = { a: 1, b: 4, c: 3 }
    expect(deepEqual(obj1, obj2, ['b'])).toBe(true)
  })

  it('should return false if objects have different numbers of keys', () => {
    const obj1 = { a: 1, b: 2 }
    const obj2 = { a: 1, b: 2, c: 3 }
    expect(deepEqual(obj1, obj2)).toBe(false)
  })

  it('should return false if one of the objects is null', () => {
    const obj1 = { a: 1, b: 2 }
    const obj2 = null
    expect(deepEqual(obj1, obj2)).toBe(false)
  })

  it('should return false if both objects are null', () => {
    const obj1 = null
    const obj2 = null
    expect(deepEqual(obj1, obj2)).toBe(true)
  })

  it('should return false if objects have different types', () => {
    const obj1 = { a: 1, b: 2 }
    const obj2 = 'not an object'
    expect(deepEqual(obj1, obj2)).toBe(false)
  })

  it('should return true for nested objects with ignored keys', () => {
    const obj1 = { a: { b: { c: 1, d: 2 } } }
    const obj2 = { a: { b: { c: 1, d: 3 } } }
    expect(deepEqual(obj1, obj2, ['d'])).toBe(true)
  })
})
