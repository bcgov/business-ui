/* returns true if the given name request is rejected */
export const isRejectedName = (name: Names): boolean => {
  return (name.state === NrState.REJECTED)
}
