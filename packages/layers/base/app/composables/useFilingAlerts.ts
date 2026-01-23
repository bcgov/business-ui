export const useFilingAlerts = (group: string = 'default') => {
  const allAlerts = useState<Record<string, Record<string, string>>>('business-filing-alerts', () => ({}))
  const groupAlerts = computed(() => allAlerts.value[group] || {})

  function setAlert(target: string, message: string) {
    if (!allAlerts.value[group]) {
      allAlerts.value[group] = {}
    }
    allAlerts.value[group][target] = message
  }

  function clearAlert(target?: string) {
    const alertGroup = allAlerts.value[group]
    if (!alertGroup) {
      return
    }

    if (target) {
      const { [target]: _, ...rest } = alertGroup
      allAlerts.value[group] = rest
    } else {
      allAlerts.value[group] = {}
    }
  }

  function watchAlertAndFocus(target: string) {
    const targetId = `alert-target-${group}-${target}`
    const messageId = `alert-message-${group}-${target}`

    const unwatch = watch(() => groupAlerts.value[target], async (message) => {
      if (!message) {
        return
      }

      const el = document.querySelector(`[data-alert-focus-target="${targetId}"]`)

      if (el instanceof HTMLElement) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setTimeout(() => el.focus({ preventScroll: true }), 100)
      }
    }, { flush: 'post' })

    onUnmounted(unwatch)
    return { targetId, messageId }
  }

  function autoClear<T>(target: string, model: Ref<T>) {
    const unwatch = watch(model, () => {
      if (groupAlerts.value[target]) {
        clearAlert(target)
      }
    }, { deep: true })
    onUnmounted(unwatch)
  }

  function attachAlerts<T>(target: string, model: Ref<T>) {
    const ids = watchAlertAndFocus(target)

    autoClear(target, model)
    onUnmounted(() => clearAlert(target))

    return ids
  }

  return {
    alerts: groupAlerts,
    setAlert,
    clearAlert,
    watchAlertAndFocus,
    attachAlerts,
    autoClear
  }
}
