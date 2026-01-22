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
    if (!allAlerts.value[group]) {
      return
    }

    if (target) {
      // eslint-disable-next-line
      delete allAlerts.value[group][target]
    } else {
      allAlerts.value[group] = {}
    }
  }

  function watchAlertAndFocus(target: string) {
    const targetId = `alert-target-${group}-${target}`
    const messageId = `alert-message-${group}-${target}`

    watch(() => groupAlerts.value[target], async (message) => {
      if (!message) {
        return
      }

      await nextTick()

      const el = document.querySelector(`[data-alert-focus-target="${targetId}"]`)

      if (el instanceof HTMLElement) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })

        setTimeout(() => {
          el.focus({ preventScroll: true })
        }, 100)
      }
    })

    return { targetId, messageId }
  }

  function autoClear<T>(target: string, model: Ref<T>) {
    whenever(() => !!groupAlerts.value[target], () => {
      const unwatch = watch(model, () => {
        clearAlert(target)
        unwatch()
      }, { deep: true })
    }, { immediate: true })
  }

  function attachAlerts<T>(target: string, model: Ref<T>) {
    const ids = watchAlertAndFocus(target)

    autoClear(target, model)

    onUnmounted(() => {
      clearAlert(target)
    })

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
