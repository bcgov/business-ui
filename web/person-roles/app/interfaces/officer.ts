import type { BadgeProps } from '@nuxt/ui'

export interface Officer {
  firstName: string
  middleName: string
  lastName: string
  preferredName?: string
  roles: OfficerRole[]
  mailingAddress: ConnectAddress
  deliveryAddress: ConnectAddress
  sameAsDelivery: boolean
  hasPreferredName: boolean
}

export interface OfficerTableState {
  state: {
    officer: Officer
    badges: BadgeProps[]
  }
  history: Array<{
    officer: Officer
    badges: BadgeProps[]
  }>
}

// export interface OfficerTableRow {
//   state: OfficerTableState
//   history: OfficerTableState[]
// }
