/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'

describe('getIsRowEdited', () => {
  it('should return false if row.original.old is undefined', () => {
    const row = { original: { new: { name: 'New' } }, old: undefined } as any
    expect(getIsRowEdited(row)).toBe(false)
  })

  it('should return false if row.original.old is missing', () => {
    const row = { original: { new: { name: 'New' } } } as any
    expect(getIsRowEdited(row)).toBe(false)
  })

  it('should return true if old state exists and new/old state are different', () => {
    const row = { original: { new: { name: 'Alison' }, old: { name: 'Alice' } } } as any
    expect(getIsRowEdited(row)).toBe(true)
  })

  it('should return false if old state exists and new/old state is the same', () => {
    const row = { original: { new: { name: 'Alice' }, old: { name: 'Alice' } } } as any
    expect(getIsRowEdited(row)).toBe(false)
  })
})
