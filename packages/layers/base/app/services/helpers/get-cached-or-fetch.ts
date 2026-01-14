import type { DefineQueryOptions } from '@pinia/colada'

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
export async function getCachedOrFetch<TData, TError = Error>(
  options: DefineQueryOptions<TData, TError>,
  force = false
): Promise<TData> {
  const cache = useQueryCache()
  await new Promise(resolve => setTimeout(resolve, 1))

  // Ensures a query entry is present in the cache.
  // will create a new one if no entry found
  const entry = cache.ensure(options)

  // fetch always triggers a network call
  // refresh will return the cached data unless the entry is marked as stale or entry.status === 'error'
  // - in which case it will trigger a network call
  // both methods will propagate the error if the network call fails
  const result = force
    ? await cache.fetch(entry)
    : await cache.refresh(entry)

  // assume valid data if no error thrown
  return result.data!
}
