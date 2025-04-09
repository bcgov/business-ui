export interface ConnectDetailHeaderSideDetail {
  label: string
  value: string
  edit?: {
    isEditing: boolean
    validation?: {
      error: string
      validate: (val: string) => string
    }
    action: (...args: unknown[]) => unknown | Promise<unknown>
  }
}

export interface ConnectDetailHeaderTitle {
  text: string
  el: string
}

export interface ConnectDetailHeaderItem {
  text: string
  itemClass?: string
  icon?: string
  iconClass?: string
  badge?: boolean
  badgeColour?: string
  link?: boolean
  linkHref?: string
}

export interface ConnectDetailHeaderBtn {
  action: (...args: unknown[]) => unknown | Promise<unknown>
  label: string
  icon?: string
  loading?: boolean
  trailingIcon?: string
}
