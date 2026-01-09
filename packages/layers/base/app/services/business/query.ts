// https://pinia-colada.esm.dev/guide/queries.html
import { useQuery } from '@pinia/colada'
import type { UseQueryOptions } from '@pinia/colada'

type QueryOptions<T> = Omit<UseQueryOptions<T>, 'key' | 'query'> & {
  query?: UseQueryOptions<T>['query']
}

const DEFAULT_STALE_TIME = 60000

export const useBusinessQuery = () => {
  const { $businessApi, $authApi } = useNuxtApp()
  const { keys } = useBusinessQueryKeys()

  function addresses(
    businessId: MaybeRefOrGetter<string>,
    options?: QueryOptions<ApiEntityOfficeAddress>
  ) {
    return useQuery({
      query: () => $businessApi<ApiEntityOfficeAddress>(`businesses/${toValue(businessId)}/addresses`),
      staleTime: DEFAULT_STALE_TIME,
      ...options,
      key: computed(() => keys.addresses(toValue(businessId)))
    })
  }

  function authorizedActions(
    businessId: MaybeRefOrGetter<string>,
    options?: QueryOptions<{ authorizedPermissions: AuthorizedAction[] }>
  ) {
    return useQuery({
      query: () => $businessApi<{ authorizedPermissions: AuthorizedAction[] }>('/permissions'),
      staleTime: DEFAULT_STALE_TIME,
      ...options,
      key: computed(() => keys.authorizedActions(toValue(businessId)))
    })
  }

  function business(
    businessId: MaybeRefOrGetter<string>,
    slim: boolean,
    options?: QueryOptions<{ business: BusinessData | BusinessDataSlim }>
  ) {
    return useQuery({
      query: () => $businessApi<{ business: BusinessData | BusinessDataSlim }>(`businesses/${toValue(businessId)}`, {
        query: slim ? { slim: true } : undefined
      }),
      staleTime: DEFAULT_STALE_TIME,
      ...options,
      key: computed(() => keys.business(toValue(businessId), slim))
    })
  }

  function document(
    businessId: MaybeRefOrGetter<string>,
    url: string,
    filename: string,
    options?: QueryOptions<Blob>
  ) {
    return useQuery({
      query: () => $businessApi<Blob>('', {
        baseURL: url, responseType: 'blob' as 'json', headers: { Accept: 'application/pdf' }
      }),
      staleTime: 0,
      gcTime: 0, // clear cached response when component unmounts
      ...options,
      key: computed(() => keys.document(toValue(businessId), url, filename))
    })
  }

  function bootstrapFiling(
    tempRegId: MaybeRefOrGetter<string>,
    options?: QueryOptions<FilingGetByIdResponse<BootstrapFiling>>
  ) {
    return useQuery({
      query: () => $businessApi<FilingGetByIdResponse<BootstrapFiling>>(`businesses/${toValue(tempRegId)}/filings`),
      staleTime: DEFAULT_STALE_TIME,
      ...options,
      key: computed(() => keys.bootstrapFiling(toValue(tempRegId)))
    })
  }

  function filing<F extends FilingRecord>(
    businessId: MaybeRefOrGetter<string>,
    filingId: MaybeRefOrGetter<string | number>,
    options?: QueryOptions<FilingGetByIdResponse<F>>
  ) {
    return useQuery({
      query: () => $businessApi<FilingGetByIdResponse<F>>(
        `businesses/${toValue(businessId)}/filings/${toValue(filingId)}`
      ),
      staleTime: DEFAULT_STALE_TIME,
      ...options,
      key: computed(() => keys.filing(toValue(businessId), toValue(filingId)))
    })
  }

  function filingComments(
    businessId: MaybeRefOrGetter<string>,
    filingId: MaybeRefOrGetter<string | number>,
    url: string,
    options?: QueryOptions<{ comments: { comment: BusinessComment }[] }>
  ) {
    return useQuery({
      query: () => $businessApi<{ comments: { comment: BusinessComment }[] }>('', { baseURL: url }),
      staleTime: DEFAULT_STALE_TIME,
      ...options,
      key: computed(() => keys.filingComments(toValue(businessId), toValue(filingId), url))
    })
  }

  function filingDocumentUrls(
    businessId: MaybeRefOrGetter<string>,
    filingId: MaybeRefOrGetter<string | number>,
    options?: QueryOptions<{ documents: BusinessFilingDocumentUrls }>
  ) {
    return useQuery({
      query: () => $businessApi<{ documents: BusinessFilingDocumentUrls }>(
        `businesses/${toValue(businessId)}/filings/${toValue(filingId)}/documents`
      ),
      staleTime: DEFAULT_STALE_TIME,
      ...options,
      key: computed(() => keys.filingDocumentUrls(toValue(businessId), toValue(filingId)))
    })
  }

  function ledger(
    businessId: MaybeRefOrGetter<string>,
    effectiveDate?: IsoDatePacific,
    options?: QueryOptions<{ filings: BusinessLedgerItem[] }>
  ) {
    const config = { params: effectiveDate ? { effective_date: effectiveDate } : {} }

    return useQuery({
      query: () => $businessApi<{ filings: BusinessLedgerItem[] }>(`businesses/${toValue(businessId)}/filings`, config),
      staleTime: DEFAULT_STALE_TIME,
      ...options,
      key: computed(() => keys.ledger(toValue(businessId), effectiveDate ?? ''))
    })
  }

  function linkedNameRequest(
    businessId: MaybeRefOrGetter<string>,
    nrNumber: MaybeRefOrGetter<string>,
    options?: QueryOptions<NameRequest>
  ) {
    return useQuery({
      query: () => $businessApi<NameRequest>(`nameRequests/${toValue(nrNumber)}/validate`),
      staleTime: DEFAULT_STALE_TIME,
      ...options,
      key: computed(() => keys.linkedNameRequest(toValue(businessId), toValue(nrNumber)))
    })
  }

  function parties(
    businessId: MaybeRefOrGetter<string>,
    query?: Record<string, unknown>,
    options?: QueryOptions<{ parties: OrgPerson[] }>
  ) {
    return useQuery({
      query: () => $businessApi<{ parties: OrgPerson[] }>(`businesses/${toValue(businessId)}/parties`, {
        query
      }),
      staleTime: DEFAULT_STALE_TIME,
      ...options,
      key: computed(() => keys.parties(toValue(businessId), query))
    })
  }

  function tasks(
    businessId: MaybeRefOrGetter<string>,
    options?: QueryOptions<TaskGetResponse>
  ) {
    return useQuery({
      query: () => $businessApi<TaskGetResponse>(`businesses/${toValue(businessId)}/tasks`),
      staleTime: DEFAULT_STALE_TIME,
      ...options,
      key: computed(() => keys.tasks(toValue(businessId)))
    })
  }

  // auth api queries
  function authInfo(
    businessId: MaybeRefOrGetter<string>,
    options?: QueryOptions<AuthInformation>
  ) {
    return useQuery({
      query: () => $authApi<AuthInformation>(`/entities/${toValue(businessId)}`),
      staleTime: DEFAULT_STALE_TIME,
      ...options,
      key: computed(() => keys.authInfo(toValue(businessId)))
    })
  }

  return {
    addresses,
    authorizedActions,
    business,
    bootstrapFiling,
    document,
    filing,
    filingComments,
    filingDocumentUrls,
    ledger,
    linkedNameRequest,
    parties,
    tasks,
    // auth api queries
    authInfo
  }
}
