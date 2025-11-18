import { isEqual } from 'es-toolkit'
import { h } from 'vue'
import type { BadgeProps } from '@nuxt/ui'
import type { ExpandedState } from '@tanstack/vue-table'
import {
  TableColumnName,
  TableColumnMailingAddress,
  TableColumnDeliveryAddress
} from '#components'

export const usePartyTable = <T extends PartyStateBase>() => {
  const t = useNuxtApp().$i18n.t
  const expanded = useState<ExpandedState | undefined>('party-table-expanded-row', () => undefined)

  const badgeMap: Record<ActionType, BadgeProps> = {
    [ActionType.ADDED]: { label: t('badge.added') },
    [ActionType.REMOVED]: { label: t('badge.removed'), color: 'neutral' as const },
    [ActionType.ADDRESS_CHANGED]: { label: t('badge.addressChanged') },
    [ActionType.CORRECTED]: { label: t('badge.corrected') },
    [ActionType.EDITED]: { label: t('badge.edited') },
    [ActionType.EMAIL_CHANGED]: { label: t('badge.emailChanged') },
    [ActionType.NAME_CHANGED]: { label: t('badge.nameChanged') },
    [ActionType.REPLACED]: { label: t('badge.replaced') },
    [ActionType.ROLES_CHANGED]: { label: t('badge.rolesChanged') }
  }

  /**
    * Returns true if the given row's actions include "ActionType.REMOVED"
  */
  function getIsRowRemoved(row: TablePartyRow<T>): boolean {
    return row.original.new.actions.includes(ActionType.REMOVED)
  }

  /**
    * Returns true if the given row's old state is not undefined and the old and new state are different
  */
  function getIsRowEdited(row: TablePartyRow<T>): boolean {
    const oldVal = row.original.old
    const newVal = row.original.new
    return !!(oldVal && !isEqual(oldVal, newVal))
  }

  function getTableBadges(row: TablePartyRow<T>): BadgeProps[] {
    const rowActions = row.original.new.actions

    if (rowActions.includes(ActionType.ADDED)) {
      return [badgeMap.ADDED]
    }

    if (rowActions.includes(ActionType.REMOVED)) {
      return [badgeMap.REMOVED]
    }

    return rowActions.map(action => badgeMap[action])
  }

  const nameColumn: TablePartyColumn<T> = {
    id: 'name',
    header: t('label.name'),
    meta: {
      class: {
        th: 'pl-6'
      }
    },
    cell: ({ row }) => {
      const badges = getTableBadges(row)
      const isRemoved = getIsRowRemoved(row)

      return h(
        TableColumnName,
        {
          party: row.original.new.name,
          badges,
          isRemoved
        },
        () => []
      )
    }
  }

  const deliveryColumn: TablePartyColumn<T> = {
    id: 'deliveryAddress',
    header: t('label.deliveryAddress'),
    cell: ({ row }) => {
      const isRemoved = getIsRowRemoved(row)

      return h(
        TableColumnDeliveryAddress,
        {
          data: row.original.new.address,
          isRemoved
        },
        () => []
      )
    }
  }

  const mailingColumn: TablePartyColumn<T> = {
    id: 'mailingAddress',
    header: t('label.mailingAddress'),
    cell: ({ row }) => {
      const isRemoved = getIsRowRemoved(row)

      return h(
        TableColumnMailingAddress,
        {
          data: row.original.new.address,
          isRemoved
        },
        () => []
      )
    }
  }

  const actionsColumn: TablePartyColumn<T> = {
    id: 'actions',
    header: () => h('span', { class: 'sr-only' }, t('label.actions')),
    meta: {
      class: {
        td: '',
        th: 'pr-6'
      }
    }
  }

  const defaultColumns: TablePartyColumn<T>[] = [
    nameColumn,
    deliveryColumn,
    mailingColumn,
    actionsColumn
  ]

  return {
    expanded,
    nameColumn,
    mailingColumn,
    deliveryColumn,
    actionsColumn,
    defaultColumns,
    getIsRowRemoved,
    getIsRowEdited
  }
}
