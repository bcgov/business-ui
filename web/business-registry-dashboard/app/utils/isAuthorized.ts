/**
 * Whether the specified action (aka permission) is authorized for the current user.
 * @returns True or False
 */
export function IsAuthorized (action: AuthorizedActions): boolean {
  const store = useAffiliationsStore()
  return store.authorizedActions.includes(action)
}
