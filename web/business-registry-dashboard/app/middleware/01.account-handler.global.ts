export default defineNuxtRouteMiddleware((to) => {
  const localePath = useLocalePath()

  // If accountid and populate are in the query params, redirect to /account/<id>
  if (to.query.accountid && to.query.populate) {
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
