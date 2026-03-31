// https://pinia-colada.esm.dev/guide/mutations.html
import type { UseMutationOptions } from '@pinia/colada'

// FUTURE: to be fleshed out as needed
// example usage in component:
// const { deleteFiling } = useBusinessMutation()
// const { asyncStatus, mutate } = deleteFiling({ onSuccess: async () => await doSomething() })
// @click="mutate({ businessId: 'BC1234567', filingId: 123456789 })"

export const useBusinessMutation = () => {
  const service = useBusinessService()

  function deleteFiling(options?: UseMutationOptions<unknown, { businessId: string, filingId: number }>) {
    const mutation = defineMutation({
      mutation: (vars: { businessId: string, filingId: number }) =>
        service.deleteFiling(vars.businessId, vars.filingId),
      ...options
    })

    return mutation()
  }

  return {
    deleteFiling
  }
}
