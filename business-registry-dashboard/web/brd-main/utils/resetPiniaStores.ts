import type { Pinia, Store } from 'pinia'
import { getActivePinia } from 'pinia'

interface ExtendedPinia extends Pinia {
  _s: Map<string, Store>;
}
export function resetPiniaStores (): void {
  const pinia = getActivePinia() as ExtendedPinia

  if (!pinia) {
    console.error('There is no stores')
  }

  pinia._s.forEach((store) => {
    store.$reset()
  })
}
