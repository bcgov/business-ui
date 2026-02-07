/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'

describe('getIsRowRemoved', () => {
  it('should return true is ActionType.REMOVED exists in row.original.new.actions', () => {
    const row = {
      original: {
        new: {
          actions: [ActionType.CHANGED, ActionType.REMOVED]
        }
      }
    } as any

    expect(getIsRowRemoved(row)).toBe(true)
  })

  it('should return false for all ActionTypes other than removed', () => {
    const allNonRemovedActions = Object.values(ActionType).filter(a => a !== ActionType.REMOVED)
    const row = {
      original: {
        new: {
          actions: allNonRemovedActions
        }
      }
    } as any

    expect(getIsRowRemoved(row)).toBe(false)
  })

  it('should return false if actions is empty', () => {
    const row = {
      original: {
        new: {
          actions: []
        }
      }
    } as any

    expect(getIsRowRemoved(row)).toBe(false)
  })
})
