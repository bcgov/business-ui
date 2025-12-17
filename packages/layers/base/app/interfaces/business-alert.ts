import type { AccordionItem } from '@nuxt/ui'

export interface BusinessAlertItem extends AccordionItem {
  alertType: BusinessAlert
  contentExtra?: string[]
  days?: string | number
  showContact?: boolean
}
