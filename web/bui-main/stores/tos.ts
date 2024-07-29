import type { FormSubmitEvent } from '#ui/types'
export const useTosStore = defineStore('bar-sbc-terms-of-service-store', () => {
  const alertStore = useAlertStore()

  // store values
  const loading = ref<boolean>(false)
  const tos = ref<TOSGetResponse>({} as TOSGetResponse)

  // get user terms of use, handle error from middleware
  async function getTermsOfUse ():Promise<TOSGetResponse | undefined> {
    const response = await useBarApi<TOSGetResponse>('/users/tos', {}, 'token')

    if (response) {
      tos.value = response
      return response
    }
  }

  // form submit event
  async function submitTermsOfUse (event: FormSubmitEvent<any>, successCallback: Function) {
    try {
      loading.value = true
      const response = await useBarApi<TOSPatchResponse>(
        '/users/tos',
        {
          method: 'PATCH',
          body: {
            istermsaccepted: event.data.agreeToTerms,
            termsversion: tos.value.termsOfUseCurrentVersion
          }
        },
        'token'
      )

      if (response.isTermsOfUseAccepted) {
        successCallback()
      }
    } catch {
      alertStore.addAlert({
        severity: 'error',
        category: AlertCategory.TOS_PATCH_ERROR
      })
    } finally {
      loading.value = false
    }
  }

  function $reset () {
    loading.value = false
    tos.value = {} as TOSGetResponse
  }

  return {
    loading,
    tos,
    getTermsOfUse,
    submitTermsOfUse,
    $reset
  }
},
{ persist: true }
)
