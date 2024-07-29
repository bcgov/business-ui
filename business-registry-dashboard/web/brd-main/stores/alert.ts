export const useAlertStore = defineStore('bar-sbc-alert-store', () => {
  const alerts = ref<Alert[]>([])

  function $reset () {
    alerts.value = []
  }

  function addAlert (alert: Alert) {
    alerts.value.push(alert)
  }

  const hasAlerts = computed(() => {
    return alerts.value.length > 0
  })

  return {
    alerts,
    hasAlerts,
    addAlert,
    $reset
  }
},
{ persist: true }
)
