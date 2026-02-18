// https://pinia-colada.esm.dev/guide/query-keys.html

/**
 * IMPORTANT: Query Key Hierarchy
 * * Our cache follows a strict hierarchy: ['business', accountId, businessId, resource, params].
 * * 1. ACCOUNT ISOLATION: The 'base' (AccountId) MUST remain as the first dynamic segment.
 * This prevents cross-account data leakage when switching accounts.
 * * 2. NESTING: Sub-resources (comments, docs) are nested under their parent IDs (e.g., filingId).
 * This allows us to invalidate an entire "folder" by targeting the parent key.
 * * 3. ORDER: When updating keys, ensure the order of existing segments is preserved.
 * Changing the order may break existing invalidation logic across the app.
*/

export const useBusinessQueryKeys = () => {
  const accountStore = useConnectAccountStore()
  const { currentAccount } = storeToRefs(accountStore)

  const base = computed(() => ['business', currentAccount.value.id] as const)

  const keys = {
    addresses: (businessId: string) => [...base.value, businessId, 'addresses'] as const,
    authInfo: (businessId: string) => [...base.value, businessId, 'auth-info'] as const,
    authorizedActions: (businessId: string) => [...base.value, businessId, 'authorized-actions'] as const,
    business: (businessId: string, slim: boolean, publicData: boolean) =>
      [...base.value, businessId, 'information', { slim, publicData }] as const,
    bootstrapFiling: (tempRegId: string) => [...base.value, tempRegId, 'bootstrap-filing'] as const,
    document: (businessId: string, url: string, filename: string) =>
      [...base.value, businessId, 'document', { url, filename }] as const,
    filing: (businessId: string, filingId: number | string) => [...base.value, businessId, 'filing', filingId] as const,
    filingComments: (businessId: string, filingId: string | number, url: string) =>
      [...base.value, businessId, 'filing', filingId, 'comments', { url }] as const,
    filingDocumentUrls: (businessId: string, filingId: string | number) =>
      [...base.value, businessId, 'filing', filingId, 'document-urls'] as const,
    ledger: (businessId: string, date: string) => [...base.value, businessId, 'ledger', { date }] as const,
    linkedNameRequest: (businessId: string, nrNumber: string) =>
      [...base.value, businessId, 'linked-name-request', nrNumber] as const,
    parties: (businessId: string, query?: Record<string, unknown>) =>
      [...base.value, businessId, 'parties', { ...query }] as const,
    shareClasses: (businessId: string, classId?: string | number) =>
      [...base.value, businessId, 'share-classes', classId ?? null] as const,
    tasks: (businessId: string) => [...base.value, businessId, 'tasks'] as const
  }

  return { keys, base }
}
