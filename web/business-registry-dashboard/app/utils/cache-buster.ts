// Cache busting and version detection utilities

export const APP_VERSION = '__APP_VERSION__' as string

/**
 * Force reload the page if version mismatch detected
 */
export function checkVersionAndReload () {
  // Store the current version in localStorage
  const STORAGE_KEY = 'brd_app_version'
  const storedVersion = localStorage.getItem(STORAGE_KEY)

  if (storedVersion && storedVersion !== APP_VERSION) {
    console.warn(`Version mismatch detected! Stored: ${storedVersion}, Current: ${APP_VERSION}`)
    // Clear localStorage/sessionStorage caches
    localStorage.removeItem(STORAGE_KEY)
    // Force reload without cache
    window.location.reload()
    return true
  }

  localStorage.setItem(STORAGE_KEY, APP_VERSION)
  return false
}

/**
 * Add cache-busting query parameter to URLs
 */
export function addCacheBuster (url: string): string {
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}v=${APP_VERSION}&t=${Date.now()}`
}

/**
 * Clear all caches and force reload
 */
export async function clearCachesAndReload () {
  try {
    // Clear localStorage
    localStorage.clear()

    // Clear sessionStorage
    sessionStorage.clear()

    // Clear cache storage if available
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(name => caches.delete(name))
      )
    }

    // Force reload without cache
    window.location.reload()
  } catch (error) {
    console.error('Error clearing caches:', error)
    // Fallback: just reload
    window.location.reload()
  }
}
