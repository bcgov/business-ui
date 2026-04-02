/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { TableColumnIdentity } from '#components'
import { mockGetColumnMeta, mockGetIsRowRemoved, mockGetTableBadges } from '../../../mocks/business-table-utils'

mockNuxtImport('useNuxtApp', () => () => ({
  $i18n: {
    t: (key: string) => {
      const labels: Record<string, string> = {
        'label.translationName': 'Translation Name',
        'label.noNameTranslations': 'No Name Translations'
      }
      return labels[key] ?? key
    }
  }
}))

describe('getNameTranslationNameColumn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct id and meta options', () => {
    const column = getNameTranslationNameColumn() as any

    expect(column.id).toBe('translation-name')
    expect(mockGetColumnMeta).toHaveBeenCalledWith('first')
  })

  it('renders an accessible header label', () => {
    const column = getNameTranslationNameColumn() as any
    const header = column.header()

    expect(header.type).toBe('span')
    expect(header.props.class).toBe('sr-only')
    expect(header.children).toBe('Translation Name')
  })

  it('renders translation name and uses it for identity label', () => {
    const row = {
      original: {
        new: {
          name: 'Nom Entreprise'
        }
      }
    }

    mockGetIsRowRemoved.mockReturnValue(false)
    mockGetTableBadges.mockReturnValue([])

    const column = getNameTranslationNameColumn() as any
    const cell = column.cell({ row })

    expect(cell.type).toBe(TableColumnIdentity)
    expect(cell.props.label).toBe('Nom Entreprise')
    expect(cell.props.class).toBe('w-full overflow-clip')
  })

  it('uses no-name fallback for label when name is empty', () => {
    const row = {
      original: {
        new: {
          name: ''
        }
      }
    }

    mockGetIsRowRemoved.mockReturnValue(false)
    mockGetTableBadges.mockReturnValue([])

    const column = getNameTranslationNameColumn() as any
    const cell = column.cell({ row })

    expect(cell.props.label).toBe('No Name Translations')
  })

  it('applies removed style and passes badges', () => {
    const row = {
      original: {
        new: {
          name: 'Nom Entreprise'
        }
      }
    }
    const badges = [{ label: 'Corrected', color: 'neutral' }]

    mockGetIsRowRemoved.mockReturnValue(true)
    mockGetTableBadges.mockReturnValue(badges)

    const column = getNameTranslationNameColumn() as any
    const cell = column.cell({ row })

    expect(cell.props.class).toContain('opacity-50')
    expect(cell.props.badges).toEqual(badges)
    expect(mockGetTableBadges).toHaveBeenCalledWith(row, undefined)
  })
})
