import { isEqual } from 'es-toolkit'

// TODO: handle internal navigation guard - before unload only handles external
// can cancel only handles the 'Cancel' button
export const useUnsavedChanges = (
  initialState: unknown,
  currentState: unknown,
  customCheck?: MaybeRefOrGetter<boolean>
) => {
  const modal = useFilingModals()

  let stop: (() => void) | null = null

  const hasChanges = computed(() => {
    const stateChanges = !isEqual(toValue(initialState), toValue(currentState))
    const customChanges = customCheck ? toValue(customCheck) : false
    return stateChanges || customChanges
  })

  function onBeforeUnload(event: BeforeUnloadEvent) {
    if (hasChanges.value) {
      event.preventDefault()
      // legacy browsers
      event.returnValue = true
    }
  }

  function revoke() {
    if (stop) {
      stop()
      stop = null
    }
  }

  function init() {
    revoke()
    stop = useEventListener(window, 'beforeunload', onBeforeUnload)
    return
  }

  function saveBlocked() {
    return !hasChanges.value
  }

  function cancelBlocked() {
    if (hasChanges.value) {
      modal.openUnsavedChangesModal(revoke)
    }
    return hasChanges.value
  }

  watch(hasChanges, (v) => {
    console.log('has changes: ', v)
  }, { immediate: true })

  onMounted(init)

  return {
    hasChanges,
    init,
    revoke,
    saveBlocked,
    cancelBlocked
  }
}
