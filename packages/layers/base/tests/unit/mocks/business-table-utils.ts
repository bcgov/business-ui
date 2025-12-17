import { vi } from 'vitest'

const mockGetColumnMeta = vi.fn()
vi.mock('~/utils/business-table/utils/get-column-meta', () => ({
  getColumnMeta: mockGetColumnMeta
}))

const mockGetTableBadges = vi.fn()
vi.mock('~/utils/business-table/utils/get-table-badges', () => ({
  getTableBadges: mockGetTableBadges
}))

const mockGetIsRowRemoved = vi.fn()
vi.mock('~/utils/business-table/utils/get-is-row-removed', () => ({
  getIsRowRemoved: mockGetIsRowRemoved
}))

const mockGetIsRowEdited = vi.fn()
vi.mock('~/utils/business-table/utils/get-is-row-edited', () => ({
  getIsRowEdited: mockGetIsRowEdited
}))

export {
  mockGetColumnMeta,
  mockGetIsRowRemoved,
  mockGetTableBadges,
  mockGetIsRowEdited
}
