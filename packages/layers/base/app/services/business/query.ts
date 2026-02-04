// IMPORTANT: Query definitions are for GET requests only - for all other methods define a mutation in the ./mutate file
// https://pinia-colada.esm.dev/guide/queries.html
import { useQuery } from '@pinia/colada'
import type { UseQueryOptions, DefineQueryOptions } from '@pinia/colada'

type QueryOptions<T> = Omit<UseQueryOptions<T>, 'key' | 'query'> & {
  query?: UseQueryOptions<T>['query']
}

type DefineOptions<TData, TError = Error> = Omit<DefineQueryOptions<TData, TError>, 'key' | 'query'> & {
  query?: DefineQueryOptions<TData, TError>['query']
}

const DEFAULT_STALE_TIME = 60000

export const useBusinessQuery = () => {
  const { $businessApi, $authApi } = useNuxtApp()
  const { keys } = useBusinessQueryKeys()

  function addressesOptions(
    businessId: MaybeRefOrGetter<string>,
    options?: DefineOptions<ApiEntityOfficeAddress>
  ) {
    return defineQueryOptions({
      query: () => $businessApi<ApiEntityOfficeAddress>(`businesses/${toValue(businessId)}/addresses`),
      staleTime: DEFAULT_STALE_TIME,
      ...options,
      key: keys.addresses(toValue(businessId))
    })
  }

  function addresses(
    businessId: MaybeRefOrGetter<string>,
    options?: QueryOptions<ApiEntityOfficeAddress>
  ) {
    return useQuery(() => addressesOptions(businessId, options as DefineOptions<ApiEntityOfficeAddress>))
  }

  function authorizedActionsOptions(
    businessId: MaybeRefOrGetter<string>,
    options?: Partial<DefineOptions<{ authorizedPermissions: AuthorizedAction[] }>>
  ) {
    return defineQueryOptions({
      query: () => $businessApi<{ authorizedPermissions: AuthorizedAction[] }>('/permissions'),
      staleTime: DEFAULT_STALE_TIME,
      ...options,
      key: keys.authorizedActions(toValue(businessId))
    })
  }

  function authorizedActions(
    businessId: MaybeRefOrGetter<string>,
    options?: QueryOptions<{ authorizedPermissions: AuthorizedAction[] }>
  ) {
    return useQuery(() => authorizedActionsOptions(
      businessId, options as DefineOptions<{ authorizedPermissions: AuthorizedAction[] }>)
    )
  }

  function businessOptions(
    businessId: MaybeRefOrGetter<string>,
    slim: boolean,
    publicData: boolean,
    options?: DefineOptions<{ business: BusinessData | BusinessDataPublic }>
  ) {
    const addedPath = publicData ? '/public' : ''
    return defineQueryOptions({
      query: () => $businessApi(`businesses/${toValue(businessId)}${addedPath}`, {
        query: slim ? { slim: true } : undefined
      }),
      staleTime: DEFAULT_STALE_TIME,
      ...options,
      key: keys.business(toValue(businessId), slim, publicData)
    })
  }

  function business(
    businessId: MaybeRefOrGetter<string>,
    slim: boolean,
    publicData: boolean,
    options?: QueryOptions<{ business: BusinessData | BusinessDataPublic }>
  ) {
    return useQuery(() => businessOptions(
      businessId, slim, publicData, options as DefineOptions<{ business: BusinessData | BusinessDataPublic }>
    ))
  }

  function documentOptions(
    businessId: MaybeRefOrGetter<string>,
    url: string,
    filename: string,
    options?: DefineOptions<Blob>
  ) {
    return defineQueryOptions({
      query: () => $businessApi<Blob>('', {
        baseURL: url, responseType: 'blob' as 'json', headers: { Accept: 'application/pdf' }
      }),
      staleTime: 0,
      gcTime: 0, // clear cached response when component unmounts
      ...options,
      key: keys.document(toValue(businessId), url, filename)
    })
  }

  function document(
    businessId: MaybeRefOrGetter<string>,
    url: string,
    filename: string,
    options?: QueryOptions<Blob>
  ) {
    return useQuery(() => documentOptions(businessId, url, filename, options as DefineOptions<Blob>))
  }

  function bootstrapFilingOptions(
    tempRegId: MaybeRefOrGetter<string>,
    options?: DefineOptions<FilingGetByIdResponse<BootstrapFiling>>
  ) {
    return defineQueryOptions({
      query: () => $businessApi<FilingGetByIdResponse<BootstrapFiling>>(`businesses/${toValue(tempRegId)}/filings`),
      staleTime: DEFAULT_STALE_TIME,
      ...options,
      key: keys.bootstrapFiling(toValue(tempRegId))
    })
  }

  function bootstrapFiling(
    tempRegId: MaybeRefOrGetter<string>,
    options?: QueryOptions<FilingGetByIdResponse<BootstrapFiling>>
  ) {
    return useQuery(
      () => bootstrapFilingOptions(tempRegId, options as DefineOptions<FilingGetByIdResponse<BootstrapFiling>>)
    )
  }

  function filingOptions<F extends FilingRecord>(
    businessId: MaybeRefOrGetter<string>,
    filingId: MaybeRefOrGetter<string | number>,
    options?: DefineOptions<FilingGetByIdResponse<F>>
  ) {
    return defineQueryOptions({
      query: () => $businessApi<FilingGetByIdResponse<F>>(
        `businesses/${toValue(businessId)}/filings/${toValue(filingId)}`
      ),
      staleTime: DEFAULT_STALE_TIME,
      ...options,
      key: keys.filing(toValue(businessId), toValue(filingId))
    })
  }

  function filing<F extends FilingRecord>(
    businessId: MaybeRefOrGetter<string>,
    filingId: MaybeRefOrGetter<string | number>,
    options?: QueryOptions<FilingGetByIdResponse<F>>
  ) {
    return useQuery(() => filingOptions(businessId, filingId, options as DefineOptions<FilingGetByIdResponse<F>>))
  }

  function filingCommentsOptions(
    businessId: MaybeRefOrGetter<string>,
    filingId: MaybeRefOrGetter<string | number>,
    url: string,
    options?: DefineOptions<{ comments: { comment: BusinessComment }[] }>
  ) {
    return defineQueryOptions({
      query: () => $businessApi<{ comments: { comment: BusinessComment }[] }>('', { baseURL: url }),
      staleTime: DEFAULT_STALE_TIME,
      ...options,
      key: keys.filingComments(toValue(businessId), toValue(filingId), url)
    })
  }

  function filingComments(
    businessId: MaybeRefOrGetter<string>,
    filingId: MaybeRefOrGetter<string | number>,
    url: string,
    options?: QueryOptions<{ comments: { comment: BusinessComment }[] }>
  ) {
    return useQuery(() => filingCommentsOptions(
      businessId, filingId, url, options as DefineOptions<{ comments: { comment: BusinessComment }[] }>
    ))
  }

  function filingDocumentUrlsOptions(
    businessId: MaybeRefOrGetter<string>,
    filingId: MaybeRefOrGetter<string | number>,
    options?: DefineOptions<{ documents: BusinessFilingDocumentUrls }>
  ) {
    return defineQueryOptions({
      query: () => $businessApi<{ documents: BusinessFilingDocumentUrls }>(
        `businesses/${toValue(businessId)}/filings/${toValue(filingId)}/documents`
      ),
      staleTime: DEFAULT_STALE_TIME,
      ...options,
      key: keys.filingDocumentUrls(toValue(businessId), toValue(filingId))
    })
  }

  function filingDocumentUrls(
    businessId: MaybeRefOrGetter<string>,
    filingId: MaybeRefOrGetter<string | number>,
    options?: QueryOptions<{ documents: BusinessFilingDocumentUrls }>
  ) {
    return useQuery(() => filingDocumentUrlsOptions(
      businessId, filingId, options as DefineOptions<{ documents: BusinessFilingDocumentUrls }>)
    )
  }

  function ledgerOptions(
    businessId: MaybeRefOrGetter<string>,
    effectiveDate?: IsoDatePacific,
    options?: DefineOptions<{ filings: BusinessLedgerItem[] }>
  ) {
    const config = { params: effectiveDate ? { effective_date: effectiveDate } : {} }
    return defineQueryOptions({
      query: () => $businessApi<{ filings: BusinessLedgerItem[] }>(`businesses/${toValue(businessId)}/filings`, config),
      staleTime: DEFAULT_STALE_TIME,
      ...options,
      key: keys.ledger(toValue(businessId), effectiveDate ?? '')
    })
  }

  function ledger(
    businessId: MaybeRefOrGetter<string>,
    effectiveDate?: IsoDatePacific,
    options?: QueryOptions<{ filings: BusinessLedgerItem[] }>
  ) {
    return useQuery(
      () => ledgerOptions(businessId, effectiveDate, options as DefineOptions<{ filings: BusinessLedgerItem[] }>)
    )
  }

  function linkedNameRequestOptions(
    businessId: MaybeRefOrGetter<string>,
    nrNumber: MaybeRefOrGetter<string>,
    options?: DefineOptions<NameRequest>
  ) {
    return defineQueryOptions({
      query: () => $businessApi<NameRequest>(`nameRequests/${toValue(nrNumber)}/validate`),
      staleTime: DEFAULT_STALE_TIME,
      ...options,
      key: keys.linkedNameRequest(toValue(businessId), toValue(nrNumber))
    })
  }

  function linkedNameRequest(
    businessId: MaybeRefOrGetter<string>,
    nrNumber: MaybeRefOrGetter<string>,
    options?: QueryOptions<NameRequest>
  ) {
    return useQuery(() => linkedNameRequestOptions(businessId, nrNumber, options as DefineOptions<NameRequest>))
  }

  function partiesOptions(
    businessId: MaybeRefOrGetter<string>,
    query?: Record<string, unknown>,
    options?: DefineOptions<{ parties: OrgPerson[] }>
  ) {
    return defineQueryOptions({
      query: () => $businessApi<{ parties: OrgPerson[] }>(`businesses/${toValue(businessId)}/parties`, {
        query
      }),
      staleTime: DEFAULT_STALE_TIME,
      ...options,
      key: keys.parties(toValue(businessId), query)
    })
  }

  function parties(
    businessId: MaybeRefOrGetter<string>,
    query?: Record<string, unknown>,
    options?: QueryOptions<{ parties: OrgPerson[] }>
  ) {
    return useQuery(() => partiesOptions(businessId, query, options as DefineOptions<{ parties: OrgPerson[] }>))
  }

  function tasksOptions(
    businessId: MaybeRefOrGetter<string>,
    options?: DefineOptions<TaskGetResponse>
  ) {
    return defineQueryOptions({
      query: () => $businessApi<TaskGetResponse>(`businesses/${toValue(businessId)}/tasks`),
      staleTime: DEFAULT_STALE_TIME,
      ...options,
      key: keys.tasks(toValue(businessId))
    })
  }

  function tasks(
    businessId: MaybeRefOrGetter<string>,
    options?: QueryOptions<TaskGetResponse>
  ) {
    return useQuery(() => tasksOptions(businessId, options as DefineOptions<TaskGetResponse>))
  }

  // auth api queries
  function authInfoOptions(
    businessId: MaybeRefOrGetter<string>,
    options?: DefineOptions<AuthInformation>
  ) {
    return defineQueryOptions({
      query: () => $authApi<AuthInformation>(`/entities/${toValue(businessId)}`),
      staleTime: DEFAULT_STALE_TIME,
      ...options,
      key: keys.authInfo(toValue(businessId))
    })
  }

  function authInfo(
    businessId: MaybeRefOrGetter<string>,
    options?: QueryOptions<AuthInformation>
  ) {
    return useQuery(() => authInfoOptions(businessId, options as DefineOptions<AuthInformation>))
  }

  return {
    addresses,
    addressesOptions,
    authorizedActions,
    authorizedActionsOptions,
    business,
    businessOptions,
    bootstrapFiling,
    bootstrapFilingOptions,
    document,
    documentOptions,
    filing,
    filingOptions,
    filingComments,
    filingCommentsOptions,
    filingDocumentUrls,
    filingDocumentUrlsOptions,
    ledger,
    ledgerOptions,
    linkedNameRequest,
    linkedNameRequestOptions,
    parties,
    partiesOptions,
    tasks,
    tasksOptions,
    // auth api queries
    authInfo,
    authInfoOptions
  }
}
