export default defineNuxtRouteMiddleware((to) => {
  const localePath = useLocalePath()

  // Matches /account/<id> anywhere in the path (including locale prefixes),
  // ensuring the account ID segment is followed only by "/" or the end
  const hasAccountInPath = /(^|\/)account\/[^/]+(\/|$)/.test(to.path)
  if (hasAccountInPath) { return }

  if (to.query.accountid) {
    // Pull accountid out, keep the rest of the query params
    const { accountid, ...restQuery } = to.query

    return navigateTo(
      {
        path: localePath(`/account/${accountid}`),
        query: { ...restQuery }
      },
      { replace: true }
    )
  }
})
