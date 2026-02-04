import type { AccordionItem } from '@nuxt/ui'

export interface BusinessAlertItem extends AccordionItem {
  alertType: BusinessAlert
  contentExtra?: { path: string, link?: { path: string, to: string } }[]
  date?: string
  showContact?: boolean
}
