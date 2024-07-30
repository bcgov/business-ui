import type { FormErrorEvent } from '#ui/types'
// scrolls to and focuses input with error from UForm component
export function handleFormErrorEvent (event: FormErrorEvent) {
  const element = document.getElementById(event.errors[0].id)
  element?.focus()
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
