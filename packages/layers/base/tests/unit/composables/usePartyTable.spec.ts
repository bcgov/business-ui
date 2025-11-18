/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { isEqual } from 'es-toolkit'

import {
  TableColumnName,
  TableColumnMailingAddress,
  TableColumnDeliveryAddress
} from '#components'

const stateMap = new Map<string, Ref<any>>()
const { mockUseState } = vi.hoisted(() => {
  return { mockUseState: vi.fn((key: string, init: () => any) => {
    if (!stateMap.has(key)) {
      stateMap.set(key, ref(init()))
    }
    return stateMap.get(key)
  }) }
})

mockNuxtImport('useState', () => {
  return mockUseState
})

mockNuxtImport('useNuxtApp', () => () => ({
  $i18n: { t: vi.fn((key: string) => key) }
}))

vi.mock('es-toolkit')

const createMockRow = (
  actions: ActionType[],
  oldVal: any | undefined = undefined,
  newVal: any = {}
) => {
  const defaultNew = {
    actions,
    address: { street: '123 Main' },
    name: { firstName: 'Test' },
    roles: [],
    ...newVal
  }

  return {
    original: {
      new: defaultNew,
      old: oldVal ? oldVal : undefined
    }
  } as TablePartyRow
}

describe('usePartyTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should init an expanded state with useState', () => {
    const { expanded } = usePartyTable()
    expect(expanded.value).toBe(undefined)
    expect(mockUseState).toHaveBeenCalledWith('party-table-expanded-row', expect.any(Function))
  })

  describe('getIsRowRemoved', () => {
    it('should return true if REMOVED action exists', () => {
      const { getIsRowRemoved } = usePartyTable()
      const row = createMockRow([ActionType.REMOVED])
      expect(getIsRowRemoved(row)).toBe(true)
    })

    it('should return false for all other actions', () => {
      const { getIsRowRemoved } = usePartyTable()
      const row = createMockRow([
        ActionType.ADDED,
        ActionType.ADDRESS_CHANGED,
        ActionType.CORRECTED,
        ActionType.EDITED,
        ActionType.EMAIL_CHANGED,
        ActionType.NAME_CHANGED,
        ActionType.REPLACED,
        ActionType.ROLES_CHANGED
      ])
      expect(getIsRowRemoved(row)).toBe(false)
    })
  })

  describe('getIsRowEdited', () => {
    it('should return true when old and new values do not match', () => {
      const { getIsRowEdited } = usePartyTable()
      const row = createMockRow([], { name: { firstName: 'Old' } }, { name: { firstName: 'New' } })
      expect(getIsRowEdited(row)).toBe(true)
    })

    it('should return false when old and new values do match', () => {
      const { getIsRowEdited } = usePartyTable()
      const same = { name: { firstName: 'Same' } }
      const row = createMockRow([], same, same)
      vi.mocked(isEqual).mockReturnValue(true)
      expect(getIsRowEdited(row)).toBe(false)
    })

    it('should return false when old value is undefined', () => {
      const { getIsRowEdited } = usePartyTable()
      const row = createMockRow([ActionType.ADDED], undefined, { name: { firstName: 'New' } })
      expect(getIsRowEdited(row)).toBe(false)
    })
  })

  describe('Columns', () => {
    describe('Default Columns', () => {
      it('should return correct columns', () => {
        const { defaultColumns, nameColumn, mailingColumn, deliveryColumn, actionsColumn } = usePartyTable()

        expect(defaultColumns).toEqual([
          nameColumn,
          deliveryColumn,
          mailingColumn,
          actionsColumn
        ])
      })
    })

    describe('Name Column', () => {
      it('sets correct props for name and address changed', () => {
        const { nameColumn } = usePartyTable()
        const mockRowData = { name: { firstName: 'John' } }
        const mockRow = createMockRow(
          [ActionType.ADDRESS_CHANGED, ActionType.NAME_CHANGED],
          { name: { firstName: 'Jon' } },
          mockRowData
        )

        const vnode = (nameColumn as any).cell({ row: mockRow })

        expect(vnode.type).toBe(TableColumnName)

        expect(vnode.props.party).toEqual(mockRowData.name)
        expect(vnode.props.isRemoved).toBe(false)
        expect(vnode.props.badges).toEqual([
          { label: 'badge.addressChanged' },
          { label: 'badge.nameChanged' }
        ])
      })

      it('sets correct props for added action', () => {
        const { nameColumn } = usePartyTable()
        const mockRow = createMockRow([ActionType.ADDED], null)

        const vnode = (nameColumn as any).cell({ row: mockRow })

        expect(vnode.props.isRemoved).toBe(false)
        expect(vnode.props.badges).toEqual([
          { label: 'badge.added' }
        ])
      })

      it('sets correct props for removed action', () => {
        const { nameColumn } = usePartyTable()
        const mockRow = createMockRow([ActionType.REMOVED])

        const vnode = (nameColumn as any).cell({ row: mockRow })

        expect(vnode.props.isRemoved).toBe(true)
        expect(vnode.props.badges).toEqual([
          { label: 'badge.removed', color: 'neutral' }
        ])
      })

      it('sets correct header text', () => {
        const { nameColumn } = usePartyTable()
        expect(nameColumn.header).toBe('label.name')
      })
    })

    describe('Delivery Column', () => {
      it('sets correct props', () => {
        const { deliveryColumn } = usePartyTable()
        const mockRowData = { address: { street: '123 Main St' } }
        const mockRow = createMockRow([ActionType.ADDRESS_CHANGED], null, mockRowData)

        const vnode = (deliveryColumn as any).cell({ row: mockRow })

        expect(vnode.type).toBe(TableColumnDeliveryAddress)
        expect(vnode.props.data).toEqual(mockRowData.address)
        expect(vnode.props.isRemoved).toBe(false)
      })

      it('sets correct header text', () => {
        const { deliveryColumn } = usePartyTable()
        expect(deliveryColumn.header).toBe('label.deliveryAddress')
      })
    })

    describe('Mailing Column', () => {
      it('sets correct props', () => {
        const { mailingColumn } = usePartyTable()
        const mockRowData = { address: { street: '123 Main St' } }
        const mockRow = createMockRow([ActionType.ADDRESS_CHANGED], null, mockRowData)

        const vnode = (mailingColumn as any).cell({ row: mockRow })

        expect(vnode.type).toBe(TableColumnMailingAddress)
        expect(vnode.props.data).toEqual(mockRowData.address)
        expect(vnode.props.isRemoved).toBe(false)
      })

      it('sets correct header text', () => {
        const { mailingColumn } = usePartyTable()
        expect(mailingColumn.header).toBe('label.mailingAddress')
      })
    })

    describe('Actions Column', () => {
      it('sets correct props', () => {
        const { actionsColumn } = usePartyTable()

        const vnode = (actionsColumn as any).header()

        expect(vnode.type).toBe('span')
        expect(vnode.props.class).toBe('sr-only')
        expect(vnode.children).toBe('label.actions')
      })
    })
  })
})
