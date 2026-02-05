import type { Row } from '@tanstack/vue-table'
import type { TableColumn } from '@nuxt/ui'

export interface TableBusinessState<T> {
  old?: T
  new: T
}

export type TableBusinessRow<T> = Row<TableBusinessState<T>>

export type TableBusinessColumn<T> = TableColumn<TableBusinessState<T>>

export type TableBusinessColumnMeta<T> = TableColumn<TableBusinessState<T>>['meta']

export type TableColumnMetaOption = 'default' | 'first' | 'last'

export type TablePartyColumnName = 'name' | 'delivery' | 'mailing' | 'effectiveDates' | 'actions'
