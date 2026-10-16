/** Used when a filing isn't completed: logs the payload instead of submitting. */
export function logBlockedSubmission(payload: object) {
  logDevOnly('submission blocked - payload: ' + JSON.stringify(payload, null, 2))
}
