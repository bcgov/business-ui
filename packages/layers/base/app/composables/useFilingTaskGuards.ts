import { isEqual } from 'es-toolkit'

// first item MUST be initial state, second item the current state
type WatcherGroup = [MaybeRefOrGetter<unknown>, MaybeRefOrGetter<unknown>] // [initial, current]

// TODO: handle internal navigation guard - before unload only handles external
// can cancel only handles the 'Cancel' button
export const useFilingTaskGuards = (
  watchers: WatcherGroup[],
  submitCondition?: MaybeRefOrGetter<boolean>
) => {
  const modal = useFilingModals()
  let stop: (() => void) | null = null
  const hasChanges = ref(false)

  watchDebounced(
    // only trigger watch callback if a groups current state changes
    () => watchers.map(item => toValue(item[1])),
    () => {
      hasChanges.value = watchers.some(([initial, current]) => {
        return !isEqual(toValue(initial), toValue(current))
      })
    },
    { debounce: 100, maxWait: 500, deep: true }
  )

  function onBeforeUnload(event: BeforeUnloadEvent) {
    if (hasChanges.value) {
      event.preventDefault()
      // legacy browsers
      event.returnValue = true
    }
  }

  function revokeBeforeUnload() {
    if (stop) {
      stop()
      stop = null
    }
  }

  function initBeforeUnload() {
    revokeBeforeUnload()
    stop = useEventListener(window, 'beforeunload', onBeforeUnload)
    return
  }

  function submitBlocked(draftId: string | undefined) {
    if (submitCondition) {
      return !toValue(submitCondition)
    }
    if (draftId !== undefined) {
      return false
    }
    return !hasChanges.value
  }

  function saveBlocked() {
    return !hasChanges.value
  }

  function cancelBlocked() {
    if (hasChanges.value) {
      modal.openUnsavedChangesModal(revokeBeforeUnload)
    }
    return hasChanges.value
  }

  onMounted(initBeforeUnload)
  onUnmounted(revokeBeforeUnload)

  return {
    hasChanges: readonly(hasChanges),
    initBeforeUnload,
    revokeBeforeUnload,
    submitBlocked,
    saveBlocked,
    cancelBlocked
  }
}
