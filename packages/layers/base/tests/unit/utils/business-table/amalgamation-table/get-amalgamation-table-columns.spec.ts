/* eslint-disable max-len */
import { vi, describe, it, expect, beforeEach } from 'vitest'

// importing required as these are not registered to Nuxt's auto-imports
import { getAddressOrJurisdictionColumn } from '#business/app/utils/business-table/amalgamation-table/get-address-or-jurisdiction-column'
import { getBusinessNameColumn } from '#business/app/utils/business-table/amalgamation-table/get-business-name-column'
import { getBusinessTypeColumn } from '#business/app/utils/business-table/amalgamation-table/get-business-type-column'

vi.mock('#business/app/utils/business-table/amalgamation-table/get-address-or-jurisdiction-column', () => ({
  getAddressOrJurisdictionColumn: vi.fn(() => ({ id: 'address-or-jurisdiction' }))
}))

vi.mock('#business/app/utils/business-table/amalgamation-table/get-business-name-column', () => ({
  getBusinessNameColumn: vi.fn(() => ({ id: 'business-name' }))
}))

vi.mock('#business/app/utils/business-table/amalgamation-table/get-business-type-column', () => ({
  getBusinessTypeColumn: vi.fn(() => ({ id: 'business-type' }))
}))

vi.mock('~/utils/business-table/columns/get-actions-column', () => ({
  getActionsColumn: vi.fn(() => ({ id: 'actions' }))
}))

describe('getAmalgamationTableColumns', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call all column utils and return them in the correct order', () => {
    const columns = getAmalgamationTableColumns()

    expect(getBusinessNameColumn).toHaveBeenCalledWith('first', undefined)
    expect(getBusinessTypeColumn).toHaveBeenCalledOnce()
    expect(getAddressOrJurisdictionColumn).toHaveBeenCalledOnce()
    expect(getActionsColumn).toHaveBeenCalledOnce()

    expect(columns).toHaveLength(4)
    expect(columns.map(c => c.id)).toEqual([
      'business-name',
      'business-type',
      'address-or-jurisdiction',
      'actions'
    ])
  })

  it('should pass badgeLabelOverrides to getBusinessNameColumn', () => {
    const badgeOverrides = { CHANGED: 'Corrected' }

    getAmalgamationTableColumns(badgeOverrides)

    expect(getBusinessNameColumn).toHaveBeenCalledWith('first', badgeOverrides)
  })
})
