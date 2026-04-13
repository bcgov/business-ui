import type { FormErrorEvent } from '@nuxt/ui'

export function onFormSubmitError(event: FormErrorEvent) {
  const errors = event.errors
  const firstErrorWithId = errors.find(e => e.id)
  const inputId = firstErrorWithId?.id
  if (inputId) {
    const element = document.getElementById(inputId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setTimeout(() => {
        element.focus({ preventScroll: true })
      }, 0)
    }
  }
}
