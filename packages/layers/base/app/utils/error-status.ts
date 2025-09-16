/**
 * Safely extracts the HTTP status code from a thrown error.
 *
 * This provides a reliable way to get a status code from an `unknown` error type.
 *
 * @param error - The error object to inspect. It can be of any type.
 * @returns The numeric HTTP status code if found, otherwise `undefined`.
 *
 * @example
 * getErrorStatus({ response: { status: 404 } }); // returns 404
 *
 * @example
 * getErrorStatus({ statusCode: 403 }); // returns 403
 *
 * @example
 * getErrorStatus(new Error("Network failed")); // returns undefined
*/
export function getErrorStatus(error: unknown): number | undefined {
  // check if error is valid object
  if (
    error
    && typeof error === 'object'
    && ('statusCode' in error || 'response' in error)
  ) {
    // handle case where error.response.status
    if ('response' in error && error.response && typeof error.response === 'object' && 'status' in error.response) {
      return error.response.status as number
    }
    // handle case where no error.response.status, fallback to error.statusCode
    if ('statusCode' in error) {
      return error.statusCode as number
    }
  }

  // return undefined if no status or statusCode
  return undefined
}
