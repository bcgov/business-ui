/**
 * Manages UI filing alerts with automatic focus management.
 * Provides state for error messages, watchers for auto-clearing on input change,
 * and scroll-to-error behavior.
 * * @param group - The unique identifier for the alert collection (e.g., a filing name).
 */
export const useFilingAlerts = (group: string = 'default') => {
  const allAlerts = useState<Record<string, Record<string, string>>>('business-filing-alerts', () => ({}))
  const groupAlerts = computed(() => allAlerts.value[group] || {})

  // sets an alert for a specific target
  async function setAlert(target: string, message: string) {
    if (!allAlerts.value[group]) {
      allAlerts.value[group] = {}
    }
    // required to reset/focus an alert if it's the same target and message
    clearAlert(target)
    await nextTick()

    // set message which triggers watchAlertAndFocus
    allAlerts.value[group][target] = message
  }

  // remove a specific target alert or reset the entire group
  function clearAlert(target?: string) {
    const alertGroup = allAlerts.value[group]
    if (!alertGroup) {
      return
    }

    if (target) {
      // required for 'no-dynamic-delete' warning
      const { [target]: _, ...rest } = alertGroup
      allAlerts.value[group] = rest
    } else {
      allAlerts.value[group] = {}
    }
  }

  // watches changes for a specific target, scrolls to target and applies focus
  function watchAlertAndFocus(target: string) {
    // IMPORTANT: these ids need to be used in the consuming component to display the message and apply focus
    const targetId = `alert-target-${group}-${target}`
    const messageId = `alert-message-${group}-${target}`

    const unwatch = watch(() => groupAlerts.value[target], async (message) => {
      if (!message) {
        return
      }

      // get and focus target element (button, input, etc) with custom attribute matching above targetId
      const el = document.querySelector(`[data-alert-focus-target="${targetId}"]`)

      if (el instanceof HTMLElement) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setTimeout(() => el.focus({ preventScroll: true }), 100)
      }
    }, { flush: 'post' })

    // cleanup watcher on unmount
    onUnmounted(unwatch)
    return { targetId, messageId }
  }

  // clear the alert when the associated ref is updated
  function autoClear<T>(target: string, model: Ref<T>) {
    const unwatch = watch(model, () => {
      if (groupAlerts.value[target]) {
        clearAlert(target)
      }
    }, { deep: true })
    // cleanup watcher on unmount
    onUnmounted(unwatch)
  }

  /**
   * Helper to link an alert, a ref, and the focus-management together.
   * @returns IDs to be used in the template (targetId and messageId).
  */
  function attachAlerts<T>(target: string, model: Ref<T>) {
    const ids = watchAlertAndFocus(target)

    autoClear(target, model)
    // cleanup specific alert if the consumer component unmounts
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
