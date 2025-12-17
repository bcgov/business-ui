import type { FormErrorEvent } from '@nuxt/ui'

export function onFormSubmitError(event: FormErrorEvent) {
  if (event?.errors?.[0]?.id) {
    const element = document.getElementById(event.errors[0].id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setTimeout(() => {
        element.focus({ preventScroll: true })
      }, 0)
    }
  }
}
