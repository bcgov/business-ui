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
  const result = force
    ? await cache.fetch(entry)
    : await cache.refresh(entry)

  return result.data!
}
