// Client-side cache detection and management
import { checkVersionAndReload, APP_VERSION } from '~/utils/cache-buster'

export default defineNuxtPlugin(() => {
  // Only run on client side
  if (import.meta.server) { return }

  // Check version on app load
  onMounted(() => {
    checkVersionAndReload()

    // Log current version for debugging
    console.info(`BRD Version: ${APP_VERSION}`)

    // Add version to global for debugging
    if (typeof window !== 'undefined') {
      ;(window as any).__BRD_VERSION__ = APP_VERSION
    }
  })

  // Add warning for development
  if (import.meta.dev) {
    console.warn('Development mode: Cache detection enabled')
  }
})
