/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'

describe('getTableBadges', () => {
  it('should return only the added badge if added exists', () => {
    const row = {
      original: {
        new: {
          actions: [ActionType.EDITED, ActionType.ADDED, ActionType.NAME_CHANGED, ActionType.REMOVED]
        }
      }
    } as any

    const badges = getTableBadges(row)

    expect(badges).toHaveLength(1)
    expect(badges[0]!.label).toBe('ADDED')
  })

  it('should return ONLY the REMOVED badge, if ADDED is absent', () => {
    const row = {
      original: {
        new: {
          actions: [ActionType.EDITED, ActionType.REMOVED, ActionType.NAME_CHANGED]
        }
      }
    } as any

    const result = getTableBadges(row)

    expect(result).toHaveLength(1)
    expect(result[0]!.label).toBe('REMOVED')
    expect(result[0]!.color).toBe('neutral')
  })

  it('should return all badges if ADDED/REMOVED are absent', () => {
    const actions = [ActionType.EDITED, ActionType.NAME_CHANGED, ActionType.ADDRESS_CHANGED]
    const row = { original: { new: { actions } } } as any

    const result = getTableBadges(row)
    expect(result).toHaveLength(3)
  })

  it('should return an empty array if actions array is empty', () => {
    const row = { original: { new: { actions: [] } } } as any

    const result = getTableBadges(row)

    expect(result).toEqual([])
  })

  it('should remove duplicate actions', () => {
    const actions = [ActionType.EDITED, ActionType.EDITED, ActionType.EDITED]
    const row = { original: { new: { actions } } } as any

    const result = getTableBadges(row)

    expect(result).toHaveLength(1)
  })
})
