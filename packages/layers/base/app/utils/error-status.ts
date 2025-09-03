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
