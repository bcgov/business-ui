export const useAnnualReportStore = defineStore('bar-sbc-annual-report-store', () => {
  const busStore = useBusinessStore()
  const alertStore = useAlertStore()

  // store values
  const loading = ref<boolean>(false)
  const arFiling = ref<ArFiling>({} as ArFiling)

  async function submitAnnualReportFiling (arData: ArFormData): Promise<{ paymentToken: number, filingId: number, payStatus: string }> {
    try {
      let apiSuffix = `/business/${busStore.businessNano.identifier}/filings`
      // add filing id to end of url if filing exists in the store
      if (Object.keys(arFiling.value).length !== 0) {
        apiSuffix += `/${arFiling.value.filing.header.id}`
      }

      const response = await useBarApi<ArFiling>(
        apiSuffix,
        {
          method: 'POST',
          body: {
            filing: {
              header: {
                filingYear: busStore.currentBusiness.nextARYear
              },
              annualReport: {
                annualGeneralMeetingDate: arData.agmDate,
                annualReportDate: busStore.nextArDate,
                votedForNoAGM: arData.votedForNoAGM,
                unanimousResolutionDate: arData.unanimousResolutionDate
              }
            }
          }
        },
        'all'
      )

      if (response) {
        arFiling.value = response
      }

      const paymentToken = response.filing.header.paymentToken
      const filingId = response.filing.header.id
      const payStatus = response.filing.header.status

      return { paymentToken, filingId, payStatus }
    } catch (e) {
      alertStore.addAlert({
        severity: 'error',
        category: AlertCategory.AR_SUBMIT_ERROR
      })
      throw e
    }
  }

  // handle filing download
  async function handleDocumentDownload (file: { name: string, url: string }) {
    const { $keycloak } = useNuxtApp()
    let blobUrl: string | undefined
    let tempAnchor: HTMLAnchorElement | undefined
    try {
      loading.value = true
      let filename: string
      const year = new Date().getFullYear()
      if (file.name === 'Receipt') {
        filename = `BC_Annual_Report_${year}_Receipt.pdf`
      } else {
        filename = `BC_Annual_Report_${year}.pdf`
      }

      const response = await $fetch(file.url, { responseType: 'blob', headers: { Authorization: `Bearer ${$keycloak.token}` } })
      const blobObj = response as unknown as Blob
      blobUrl = window.URL.createObjectURL(blobObj)
      tempAnchor = document.createElement('a')
      // create temporary <a> tag with download url
      tempAnchor.style.display = 'none'
      tempAnchor.href = blobUrl
      tempAnchor.download = filename

      // Safari thinks _blank anchor are pop ups. We only want to set _blank
      // target if the browser does not support the HTML5 download attribute.
      // This allows you to download files in desktop safari if pop up blocking
      // is enabled.
      if (typeof tempAnchor.download === 'undefined') {
        tempAnchor.setAttribute('target', '_blank')
      }
      document.body.appendChild(tempAnchor)
      tempAnchor.click() // invoke download on temp anchor
    } catch {
      alertStore.addAlert({
        severity: 'error',
        category: AlertCategory.DOCUMENT_DOWNLOAD
      })
    } finally {
      loading.value = false
      setTimeout(() => {
        // cleanup blob url and temp anchor
        if (tempAnchor) {
          document.body.removeChild(tempAnchor)
        }
        if (blobUrl) {
          window.URL.revokeObjectURL(blobUrl)
        }
      }, 200)
    }
  }

  function $reset () {
    loading.value = false
    arFiling.value = {} as ArFiling
  }

  return {
    loading,
    arFiling,
    submitAnnualReportFiling,
    handleDocumentDownload,
    $reset
  }
},
{ persist: true }
)
