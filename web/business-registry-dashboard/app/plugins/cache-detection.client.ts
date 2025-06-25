// Client-side cache detection and management

/**
 * Get the current app version from runtime config
 */
function getAppVersion (): string {
  const runtimeConfig = useRuntimeConfig()
  return runtimeConfig.public.version as string
}

/**
 * Force reload the page if version mismatch detected
 */
function checkVersionAndReload () {
  // Store the current version in localStorage
  const STORAGE_KEY = 'brd_app_version'
  const currentVersion = getAppVersion()
  const storedVersion = localStorage.getItem(STORAGE_KEY)

  if (storedVersion && storedVersion !== currentVersion) {
    console.warn(`Version mismatch detected! Stored: ${storedVersion}, Current: ${currentVersion}`)
    // Clear localStorage/sessionStorage caches
    localStorage.removeItem(STORAGE_KEY)
    // Force reload without cache
    window.location.reload()
    return true
  }

  localStorage.setItem(STORAGE_KEY, currentVersion)
  return false
}

export default defineNuxtPlugin(() => {
  console.log('Cache detection plugin loaded. Checking version and reloading.')

  // Check version immediately when plugin runs
  checkVersionAndReload()

  const currentVersion = getAppVersion()

  // Log current version for debugging
  console.info(`BRD Version: ${currentVersion}`)
})
