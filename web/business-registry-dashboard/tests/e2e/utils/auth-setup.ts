import { config as dotenvConfig } from 'dotenv'

// load default env
dotenvConfig()

// checks if site is available before running setup
async function isServerReady (url: string, timeout: number = 30000): Promise<boolean> {
  const startTime = Date.now()
  while (Date.now() - startTime < timeout) { // loop until timeout is reached
    try {
      const response = await fetch(url) // try to ping site
      // return true if site is ready
      if (response.ok) {
        return true
      }
    } catch {
      // not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000)) // wait 1sec between fetches
  }
  return false // return false if reached timeout and no site is loaded
}

// handle auth setup - only checks server readiness
// Auth is handled per-test via page.route() API mocking (same pattern as corps/person-roles)
async function authSetup () {
  const baseURL = process.env.NUXT_BASE_URL!

  console.log('Waiting for the server to be ready...')
  const serverReady = await isServerReady(baseURL)
  if (!serverReady) {
    throw new Error(`Server at ${baseURL} did not become ready within the timeout period.`)
  }
}

export default authSetup
