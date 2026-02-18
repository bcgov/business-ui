import type { AlertColor, AlertVariant } from '#ui/types'
// FUTURE: extend from AlertProps type from nuxt/ui once available
export interface ModalAlertProps {
  color: AlertColor,
  icon: string,
  translationPath: string,
  variant: AlertVariant,
  class?: string
}
