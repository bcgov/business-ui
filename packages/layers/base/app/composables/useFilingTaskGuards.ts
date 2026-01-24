import { isEqual } from 'es-toolkit'

// TODO: handle internal navigation guard - before unload only handles external
// can cancel only handles the 'Cancel' button

/**
 * [initialState, currentState]
 * @property initial - Baseline snapshot state to compare against.
 * @property current - Active state currently being edited.
 */
type WatcherGroup = [
  initial: MaybeRefOrGetter<unknown>,
  current: MaybeRefOrGetter<unknown>
]

/**
 * Manages task guards (blocking save/submit) and "unsaved changes" prompts.
 *
 * @param watchers - Array of {@link WatcherGroup} tuples for deep equality checking.
 * @param submitCondition - Optional; if true, bypasses 'hasChanges' check to allow final submission.
 */
export const useFilingTaskGuards = (
  watchers: WatcherGroup[],
  submitCondition?: MaybeRefOrGetter<boolean>
) => {
  const route = useRoute()
  const modal = useFilingModals()
  let stop: (() => void) | null = null
  const hasChanges = ref(false)

  watchDebounced(
    // watches the 'current' (not initial) state of each WatcherGroup
    // eg: group = [groupItemInitial, groupItemCurrent] <-- watches groupItemCurrent at index 1
    () => watchers.map(item => toValue(item[1])),
    () => {
      // returns true if at least one groups 'current' value !== the groups 'initial' value
      hasChanges.value = watchers.some(([initial, current]) => {
        return !isEqual(toValue(initial), toValue(current))
      })
    },
    { debounce: 100, maxWait: 500, deep: true }
  )

  // browser event that prompts the user when they try to navigate away if they have unsaved changes
  // (tab close, refresh, external links)
  function onBeforeUnload(event: BeforeUnloadEvent) {
    if (hasChanges.value) {
      event.preventDefault()
      // legacy browsers
      event.returnValue = true
    }
  }

  // removes the browser event listener
  function revokeBeforeUnload() {
    if (stop) {
      stop()
      stop = null
    }
  }

  // initializes the browser event listener
  // https://vueuse.org/core/useEventListener/
  function initBeforeUnload() {
    revokeBeforeUnload()
    // attach event listener - returns a cleanup function assigned to 'stop'
    stop = useEventListener(window, 'beforeunload', onBeforeUnload)
  }

  // determines if a filing is allowed to be submitted
  function canSubmit() {
    // if an additonal submit condition is required that is not handled by the watchers, check it here
    // NOTE: submitCondition is not for a form schema (zod) validation check
    // the form should be validated prior to evaluating submitCondition
    if (submitCondition) {
      return toValue(submitCondition)
    }
    // if we have a draft, the 'initial' state has already been saved
    // drafts can be submitted without new local changes
    // allowing the user to resume a saved draft and submit immediately without making any other edits
    if (route.query.draft) {
      return true
    }
    // new filings without a draft must have changes to submit
    return hasChanges.value
  }

  // only allow saves if there has been local changes made to the filing
  function canSave() {
    return hasChanges.value
  }

  // returns true if there are no unsaved changes -> no unsaved changes, allow cancelling with no modal prompt
  // will open the 'unsaved changes' modal and prompt the user to either keep editing or confirm that
  // they want to navigate away and lose their progress
  // requires 'revokeBeforeUnload' to bypass the browser event listener if they choose to leave
  function canCancel() {
    if (hasChanges.value) {
      modal.openUnsavedChangesModal(revokeBeforeUnload)
      return false
    }
    return true
  }

  // init/cleanup window listener
  onMounted(initBeforeUnload)
  onUnmounted(revokeBeforeUnload)

  return {
    hasChanges: readonly(hasChanges),
    initBeforeUnload,
    revokeBeforeUnload,
    canSubmit,
    canSave,
    canCancel
  }
}
