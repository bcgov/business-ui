import type { ButtonProps, IconProps, BadgeProps, LinkProps } from '@nuxt/ui'

export interface BusinessTombstoneSideDetail {
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

export interface BusinessTombstoneTitle {
  text: string
  el: string
}

export interface BusinessTombstoneItem {
  text: string
  itemClass?: string
  icon?: IconProps
  badge?: BadgeProps
  link?: LinkProps
}

export type BusinessTombstoneBtn = ButtonProps
