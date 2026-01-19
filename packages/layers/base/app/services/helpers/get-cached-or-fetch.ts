import type { DefineQueryOptions, DataState } from '@pinia/colada'

/**
 * Resolves a query from the cache or fetches it from the network if necessary.
 * * This utility ensures a cache entry exists and handles data fetching
 * based on the current cache state and the `force` flag.
 *
 * @template TData - The expected shape of the data returned by the query.
 * @template TError - The error type if the query fails. Defaults to `Error`.
 * * @param options - The query definition object
 * containing the key, query function, and cache settings (e.g., staleTime).
 * @param [force=false] - When true, bypasses the cache and triggers
 * a network call (cache.fetch). When false, returns cached data if fresh,
 * or background refreshes if stale or in error state (cache.refresh).
 * * @returns A promise that resolves to the query data.
 * @throws throws the underlying network error if the fetch or refresh fails.
 * * @example
 * // uses cache if fresh
 * const business = await getCachedOrFetch(businessOptions('BC123'));
 * * // Forced fetch: ignores cache and hits API
 * const freshData = await getCachedOrFetch(businessOptions('BC123'), true);
*/
export async function getCachedOrFetch<TData>(
  options: DefineQueryOptions<TData>,
  force = false
): Promise<TData> {
  const cache = useQueryCache()
  // NB: Required to prevent calls within 1ms causing a promise to return before the cached response is complete.
  // i.e. without below:
  // -> Call 1 for BC1234567 data
  // -> Call 2 for BC1234567 data within 1ms
  // -> Call 1 is cancelled
  // -> Promise returns with undefined response from Call 1 instead of awaiting Call 2
  await new Promise(resolve => setTimeout(resolve, 1))
  // Ensures a query entry is present in the cache.
  // will create one if it doesn't exist
  const entry = cache.ensure(options)

  // NB: _localPromise
  // required for concurrent requests triggering the same query (eg: Promise.all)
  // where entry.pending hasn't updated yet (<1ms difference)

  // ensure new request if force
  if (force && entry.meta._localPromise) {
    delete entry.meta._localPromise
  }
  // returns existing promise if !force and a request is in progress
  if (!force && entry.meta._localPromise) {
    const result = await (entry.meta._localPromise as Promise<DataState<TData, Error>>)
    return result.data!
  }

  // fetch always triggers a network call
  // refresh will return the cached data unless the entry is marked as stale or entry.status === 'error'
  // - in which case it will trigger a network call
  // both methods will propagate the error if the network call fails
  const promise = force
    ? cache.fetch(entry)
    : cache.refresh(entry)

  // assign promise reference for concurrent request check
  entry.meta._localPromise = promise

  try {
    const result = await (promise as Promise<DataState<TData, Error>>)
    // assume valid data if no error thrown
    return result.data!
  } finally {
    // cleanup for future requests
    if (entry.meta._localPromise === promise) {
      delete entry.meta._localPromise
    }
  }
}
