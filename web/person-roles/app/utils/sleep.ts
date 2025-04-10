/**
 * Pauses for a specified number of milliseconds.
 * @param {number} [ms=3000] - The pause duration, in milliseconds. Default of 3000ms.
 * @returns {Promise<void>} empty promise.
 */
export function sleep(ms: number = 3000): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
