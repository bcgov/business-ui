import type { EntryKey } from '@pinia/colada'

export const useBusinessQuery = () => {
  const { $businessApi } = useNuxtApp()
  const keys = useBusinessQueryKeys()

  function getBusiness(businessId: string, slim: boolean) {
    const query = defineQuery({
      key: (() => keys.getBusinessKey(businessId, slim)) as unknown as EntryKey,
      query: () => $businessApi<{ business: BusinessData | BusinessDataSlim }>(`businesses/${businessId}`, {
        query: slim ? { slim: true } : undefined
      }),
      staleTime: 60000
    })

    return query()
  }

  return {
    getBusiness
  }
}
