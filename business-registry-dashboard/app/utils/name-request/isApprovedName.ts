/* returns true if given name is approved */
export const isApprovedName = (name: Names): boolean => {
  return (name.state === NrState.APPROVED)
}
