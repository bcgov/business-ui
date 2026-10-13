import { cloneDeep } from 'es-toolkit'

/**
 * The form state plumbing for every filing store
 * NB: `getDefaults` is re-run on reset so the schema defaults are rebuilt rather than shared.
 */
export const useFilingFormState = <T extends object>(getDefaults: () => T) => {
  const formState = reactive(getDefaults()) as T
  const initialFormState = shallowRef<T>({} as T)
  const initializing = ref<boolean>(false)

  /** Baselines the form state for change detection once the pending updates have flushed. */
  async function snapshotInitialState() {
    await nextTick()
    initialFormState.value = cloneDeep(formState)
    initializing.value = false
  }

  function resetFormState() {
    Object.assign(formState, getDefaults())
    initialFormState.value = cloneDeep(formState)
  }

  return {
    formState,
    initialFormState,
    initializing,
    snapshotInitialState,
    resetFormState
  }
}
