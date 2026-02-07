/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'

describe('getIsRowEdited', () => {
  it('should return true for all ActionTypes other than added', () => {
    const allNonAddedActions = Object.values(ActionType).filter(a => a !== ActionType.ADDED)
    const row = {
      original: {
        new: {
          actions: allNonAddedActions
        }
      }
    } as any

    expect(getIsRowEdited(row)).toBe(true)
  })

  it('should return false when all ActionTypes`s are included', () => { // includes ADDED
    const allActions = Object.values(ActionType)
    const row = {
      original: {
        new: {
          actions: allActions
        }
      }
    } as any

    expect(getIsRowEdited(row)).toBe(false)
  })

  it('should return false for all ActionType.ADDED', () => {
    const row = {
      original: {
        new: {
          actions: [ActionType.ADDED]
        }
      }
    } as any

    expect(getIsRowEdited(row)).toBe(false)
  })

  it('should return false if actions is empty', () => {
    const row = {
      original: {
        new: {
          actions: []
        }
      }
    } as any

    expect(getIsRowEdited(row)).toBe(false)
  })
})
