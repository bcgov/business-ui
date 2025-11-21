import type { AlertCategory } from '~/enums/alert-category'

export interface Alert {
  category: AlertCategory
  severity: 'info' | 'warning' | 'error'
  title?: string
  description?: string
}
