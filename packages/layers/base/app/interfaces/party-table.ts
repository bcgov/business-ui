import type { Row } from '@tanstack/vue-table'
import type { TableColumn } from '@nuxt/ui'

export type PartyStateBase = {
  actions: ActionType[]
  address: AddressSchema
  name: PartyNameSchema
  roles: Role[]
}

export interface TablePartyState<T extends PartyStateBase = PartyStateBase> {
  old?: T
  new: T
}

export type TablePartyRow<T extends PartyStateBase = PartyStateBase> = Row<TablePartyState<T>>

export type TablePartyColumn<T extends PartyStateBase = PartyStateBase> = TableColumn<TablePartyState<T>>
