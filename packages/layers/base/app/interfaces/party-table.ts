import type { Row } from '@tanstack/vue-table'
import type { TableColumn } from '@nuxt/ui'

export type PartyStateBase = {
  actions: ActionType[]
  address: AddressSchema
  name: PartyNameSchema
  roles: Role[]
}

export interface TablePartyState<T = unknown> {
  old?: (T & PartyStateBase)
  new: (T & PartyStateBase)
}

export type TablePartyRow<T = unknown> = Row<TablePartyState<T>>

export type TablePartyColumn<T = unknown> = TableColumn<TablePartyState<T>>
