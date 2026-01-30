/**
 * Logs a warning message to the console only in Development or CI environments.
 * * @warning **USE SPARINGLY.** This is intended for permanent developer warnings
 * (e.g., missing configuration, logic errors or other) that would typically
 * take significant time to track down.
 * * @param message - The debug message to display in the console warning.
*/
export function logDevOnly(message: string) {
  if (import.meta.env.DEV || process.env.CI) {
    // create stack trace to add context to warning
    const stack = new Error().stack?.split('\n')[2]?.trim()
    console.warn(`[debug] ${message}\n ${stack}`)
  }
}
