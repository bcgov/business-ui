/**
 * Represents a pairing between an active form subject (model state)
 * and its associated UI alert target key.
*/
interface ActiveSubjectGroup {
  /**
   * The active model object for the form subject.
   * Typically set via `defineModel` in the parent management component.
   * Evaluated as active/open when defined.
  */
  subject: MaybeRefOrGetter<unknown>

  /**
   * The unique key used by `useFilingAlerts` to focus and attach
   * task guard error messages for this specific sub-form.
  */
  alertTarget: string // The associated target ID the task guard config is associated with
}

/**
 * Configuration options for the {@link useManageCommon} composable.
*/
interface ManageCommonOptions {
  /**
   * The state key used to scope filing alerts in `useFilingAlerts` amd the tableState inside all manage components.
  */
  stateKey: string

  /**
   * One or more active subject groups representing sub-forms managed by the component.
   * Accepts a single {@link ActiveSubjectGroup} or an array for more complex components.
  */
  activeSubjects: MaybeRefOrGetter<ActiveSubjectGroup | ActiveSubjectGroup[]>

  /**
   * Variant key defining component behavior - {@link ManageVariant}.
   * Supports partial string matching for variants.
  */
  variant?: MaybeRefOrGetter<ManageVariant | undefined>

  /**
   * The computed list of allowed table actions (e.g., ADD or CHANGE`) {@link ManageAllowedAction}.
   * If `undefined`, all default actions are allowed unless blocked by variant rules.
  */
  allowedActions?: MaybeRefOrGetter<ManageAllowedAction[] | undefined>

  /**
   * Custom table label overrides for action buttons and status badges.
  */
  labelOverrides?: MaybeRefOrGetter<TableLabelOverrides | undefined>

  /**
   * External override flag forcing action prevention across the table, even when no local subject form is active.
  */
  preventActions?: MaybeRefOrGetter<boolean | undefined>

  /**
   * A signal from a parent component that triggers active form alert messages when updated.
  */
  actionPreventedSignal?: MaybeRefOrGetter<number>
}

/**
 * Centralizes shared management logic across components.
 *
 * @param opts - Configuration options for models, variants, and alert targets.
 * @returns An object containing computed states and alert helpers.
 *
 * @example
 * ```ts
 * const activeCo = defineModel<ActiveCourtOrderSchema>('active-co')
 *
 * const {
 *   shouldPreventActions,
 *   tableAllowedActions,
 *   tableLabels,
 *   setActiveSubjectAlert,
 *   clearAllAlerts
 * } = useManageCommon({
 *   stateKey: 'manage-court-orders',
 *   variant: () => props.variant,
 *   allowedActions: () => props.allowedActions,
 *   activeSubjects: {
 *     subject: activeCo,
 *     alertTarget: 'court-order-poa-form'
 *   }
 * })
 * ```
*/
export const useManageCommon = (opts: ManageCommonOptions) => {
  const { t } = useNuxtApp().$i18n
  const { setAlertText } = useConnectButtonControl()
  const { setAlert, clearAlert } = useFilingAlerts(opts.stateKey)

  // Normalize activeSubjects opts into an array
  const subjectGroups = computed<ActiveSubjectGroup[]>(() => {
    const subs = toValue(opts.activeSubjects)
    if (!subs) {
      return []
    }
    return Array.isArray(subs) ? subs : [subs]
  })

  // returns true if any active subject is defined (The subject will be defined when a form is open)
  const hasActiveSubject = computed(() => subjectGroups.value.some(sg => !!toValue(sg.subject)))

  // returns true if the Manage variant includes 'readonly' - allows partial string matching for variant combos
  const isReadOnlyVariant = computed(() => toValue(opts.variant)?.includes('readonly') ?? false)

  // returns true if the Manage variant includes 'correct' - allows partial string matching for variant combos
  const isCorrectVariant = computed(() => toValue(opts.variant)?.includes('correct') ?? false)

  // returns true if there's an active subject being added or edited
  // or if the parent component has set the preventActions prop to true
  const shouldPreventActions = computed(() => hasActiveSubject.value || toValue(opts.preventActions))

  // returns table label overrides (badges, action buttons) in order of precedence
  const tableLabels = computed(() => {
    const labels = toValue(opts.labelOverrides)
    // 1. Overrides specifically set by the parent
    if (labels) {
      return labels
    }
    // 2. Correct labels if variant includes 'correct'
    if (isCorrectVariant.value) {
      return getCorrectionLabelOverrides()
    }
    // 3. Undefined - uses default labels
    return undefined
  })

  // configures the table allowed actions in order of precendence
  const tableAllowedActions = computed(() => {
    // 1. readonly - no actions allowed
    if (isReadOnlyVariant.value) {
      return []
    }
    // 2. Actions set by the actions prop
    // May be undefined in which case the component will allow all actions by default
    return toValue(opts.allowedActions)
  })

  function setActiveSubjectAlert() {
    subjectGroups.value.forEach((sg) => {
      if (toValue(sg.subject)) {
        setAlert(sg.alertTarget, t('text.finishTaskBeforeOtherChanges'))
      }
    })
  }

  function clearAllAlerts() {
  // clear alerts in all sub forms
    subjectGroups.value.forEach((sg) => {
      clearAlert(sg.alertTarget)
    })

    // clear alert in button control
    setAlertText(undefined)
  }

  watch(() => toValue(opts.actionPreventedSignal), (value) => {
    if (value) {
      setActiveSubjectAlert()
    }
  })

  return {
    hasActiveSubject,
    isReadOnlyVariant,
    isCorrectVariant,
    shouldPreventActions,
    tableAllowedActions,
    tableLabels,
    setActiveSubjectAlert,
    clearAllAlerts
  }
}
