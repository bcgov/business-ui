/**
 * The "View and Change Business Information" page in the edit UI for a business, the same page
 * the business dashboard links to: special resolution for coops, change for firms (SP/GP),
 * alteration for everything else, with the account and business ids in the query.
 */
export function getBusinessEditUrl(identifier: string, legalType: string, accountId?: number | string): string {
  const page = legalType === CorpTypeCd.COOP
    ? 'special-resolution'
    : ([CorpTypeCd.SOLE_PROP, CorpTypeCd.PARTNERSHIP] as string[]).includes(legalType)
      ? 'change'
      : 'alteration'
  const url = new URL(`${identifier}/${page}`, useRuntimeConfig().public.businessEditUrl)
  if (accountId) {
    url.searchParams.set('accountid', String(accountId))
  }
  url.searchParams.set('businessid', identifier)
  return url.toString()
}
