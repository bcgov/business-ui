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

export type TablePartyColumnName
  = 'name' | 'roles' | 'delivery' | 'mailing' | 'effectiveDates' | 'email' | 'actions'

/** Display-level label overrides for table action buttons, badges and headers */
export interface TableLabelOverrides {
  /** Override the "Change" edit button label (e.g. "Correct") */
  editLabel?: string
  /** Override the "Delete" remove button label for existing rows (e.g. "Cease") */
  removeLabel?: string
  /** Override the remove button icon (e.g. "i-mdi-close" to go with "Cease") */
  removeIcon?: string
  /** Override the "Add {subject}" header button label (e.g. "Appoint New Director") */
  addLabel?: string
  /** Override badge text for specific action types (e.g. { ADDRESS_CHANGED: 'CORRECTED' }) */
  badges?: Partial<Record<ActionType, string>>
  /** Override column header text (e.g. { effectiveDates: 'Appointed/Elected' }) */
  headers?: Partial<Record<TablePartyColumnName, string>>
}

/**
 * A row dropdown entry that opens the edit form for a subset of actions only
 * (e.g. "Change Address" -> [ADDRESS_CHANGE]). When a table has edit options, existing rows
 * get one entry per option instead of the single "Change" entry; added rows keep the full form.
 */
export interface TableEditOption {
  label: string
  icon?: string
  actions: ManageAllowedAction[]
}

/** Which row action is the main button: the edit entry (default) or the remove entry (e.g. "Cease") */
export type TablePrimaryAction = 'edit' | 'remove'

/** Display options for party table columns that have more than one rendering */
export interface TablePartyColumnOptions {
  effectiveDates?: {
    /** 'long' (April 12, 2025) is the default; 'iso' renders 2025-04-12 */
    dateFormat?: 'long' | 'iso'
    /** render the appointment date alone instead of "{date} to current" */
    hideCurrent?: boolean
  }
}
