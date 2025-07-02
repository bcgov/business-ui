import type { ButtonProps } from '@nuxt/ui'

export interface ConnectBtnControl {
  leftButtons: ButtonProps[]
  rightButtons: ButtonProps[]
  leftAlertText?: string
  rightAlertText?: string
}
