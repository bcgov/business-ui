import type { ExpandedState, Row } from '@tanstack/vue-table'
import { isEqual } from 'es-toolkit'
import { isEmpty } from 'es-toolkit/compat'

export const useOfficerStore = defineStore('officer-store', () => {
  const na = useNuxtApp()
  const t = na.$i18n.t
  const modal = useFilingModals()
  const service = useBusinessService()
  const businessStore = useBusinessStore()
  const { business } = storeToRefs(businessStore)
  const ld = useConnectLaunchDarkly()
  const rtc = useRuntimeConfig().public

  const initializing = ref<boolean>(false) // officer store loading state
  const addingOfficer = ref<boolean>(false) // flag to show/hide Add Officer form
  const initialOfficers = shallowRef<Officer[]>([]) // officer state on page load
  const officerTableState = ref<OfficerTableState[]>([]) // officer state displayed in table
  const expanded = ref<ExpandedState | undefined>(undefined) // what table rows are expanded
  const editState = ref<Officer>({} as Officer) // default state passed to officer form in edit mode
  const folio = reactive<{ number: string }>({ number: '' })
  const filingDraftState = shallowRef<OfficersDraftFiling>({} as OfficersDraftFiling) // filing state saved as draft

  const disableActions = computed(() => addingOfficer.value || !!expanded.value || initializing.value)

  async function init(businessId: string, _filingSubType?: string, draftId?: string) {
    try {
      // reset any previous state (ex: user switches accounts) and init loading state
      $reset()
      initializing.value = true

      // TODO: add in parties to init call once officers is updated to use party table
      const { draftFiling } = await useFiling().initFiling(
        businessId,
        FilingType.CHANGE_OF_OFFICERS,
        undefined,
        draftId
      )

      if (draftFiling?.filing) {
        filingDraftState.value = { filing: draftFiling.filing, errors: [] } as unknown as OfficersDraftFiling
        folio.number = draftFiling.filing.header?.folioNumber || ''
      }

      if (!rtc.playwright) { // TODO: figure out mock LD in e2e tests
        const allowedBusinessTypes = (
          await ld.getFeatureFlag('supported-change-of-officers-entities', '', 'await')
        ).split(' ') as CorpTypeCd[]
        if (!business.value || !allowedBusinessTypes.includes(business.value.legalType)) {
          await modal.openFilingNotAvailableModal()
          return
        }
      }

      const parties = await service.getParties(businessId, { classType: 'officer' })

      // map current/existing officers
      const officers = parties.map((p) => {
        const mailingAddress = formatAddressUi(p.mailingAddress)
        const deliveryAddress = formatAddressUi(p.deliveryAddress)
        const id = p.officer.id ? String(p.officer.id) : undefined
        const preferredName = p.officer.alternateName ?? ''

        // map api roles to ui roles, filter roles that end up with an undefined type
        const roles: OfficerRoleObj[] = p.roles.map(role => ({
          roleType: API_ROLE_TO_UI_ROLE_MAP[role.roleType!.toLowerCase()],
          roleClass: 'OFFICER',
          appointmentDate: role.appointmentDate,
          cessationDate: role.cessationDate ?? null
        })).filter(role => role.roleType !== undefined) as OfficerRoleObj[]

        return {
          id,
          firstName: p.officer.firstName ?? '',
          middleName: p.officer.middleInitial ?? '',
          lastName: p.officer.lastName ?? '',
          preferredName,
          roles,
          mailingAddress,
          deliveryAddress,
          sameAsDelivery: isEqual(mailingAddress, deliveryAddress),
          hasPreferredName: preferredName.length > 0
        }
      })

      initialOfficers.value = officers || [] // retain initial officer state before changes

      // set table to returned draft state if exists
      if (draftId && draftFiling !== undefined && filingDraftState.value?.filing?.changeOfOfficers?.length) {
        officerTableState.value = JSON.parse(JSON.stringify(filingDraftState.value.filing.changeOfOfficers))
        return
      }

      // map intitial officers data to display in table if no draft officers
      officerTableState.value = officers?.map(o => ({
        new: o,
        old: o
      })) || []
    } catch (error) {
      // should never get here unless unhandled type/value error, fetch errors handled by useFiling composable
      await modal.openInitFilingErrorModal(error)
    } finally {
      initializing.value = false
    }
  }

  /**
  *  Adds a 'net new' officer object to the table state
  *  @param {Officer} v The new officer object
  */
  function addNewOfficer(v: Officer): void {
    // set address to empty fields if not fully entered
    const addressSchema = getRequiredAddressSchema()
    const isMailingValid = (addressSchema.safeParse(v.mailingAddress)).success
    if (!isMailingValid) {
      v.mailingAddress = getNewOfficer().mailingAddress
    }

    const newState = JSON.parse(JSON.stringify({
      new: v
    }))

    officerTableState.value = [
      ...officerTableState.value,
      newState
    ]
  }

  /**
  *  Updates the officer table state at the provided row
  *  @param {OfficerTableState} newState The new officer object
  *  @param {Row<OfficerTableState>} row The row to update with the new state
  */
  function updateOfficerTable(newState: OfficerTableState, row: Row<OfficerTableState>): void {
    const index = row.index

    officerTableState.value = [
      ...officerTableState.value.slice(0, index),
      newState,
      ...officerTableState.value.slice(index + 1)
    ]
  }

  /**
  *  Removes an officer from the table state
  *  @param {Row<OfficerTableState>} row The row to remove
  */
  function removeOfficer(row: Row<OfficerTableState>): void {
    const oldOfficer = row.original.old
    const newOfficer = row.original.new

    // delete newly added officer from table - no old officer means new only
    if (oldOfficer === undefined) {
      officerTableState.value = [
        ...officerTableState.value.slice(0, row.index),
        ...officerTableState.value.slice(row.index + 1)
      ]
    } else { // else add cessation date to roles
      const todayUtc = getToday()

      const ceasedRoles: OfficerRoleObj[] = newOfficer.roles.map(role => ({
        ...role,
        cessationDate: todayUtc
      }))

      const newState = JSON.parse(JSON.stringify({
        new: { ...newOfficer, roles: ceasedRoles },
        old: oldOfficer
      }))

      updateOfficerTable(newState, row)
    }
  }

  /**
  *  Undoes the most recent change by resetting the officer's state
  *  to the previous state in the history array at the given row
  *  @param {Row<OfficerTableState>} row The row to undo
  */
  function undoOfficer(row: Row<OfficerTableState>): void {
    const oldOfficer = row.original.old

    if (oldOfficer) {
      const newState = JSON.parse(JSON.stringify({
        new: oldOfficer,
        old: oldOfficer
      }))
      updateOfficerTable(newState, row)
    }
  }

  /**
  * Edits the officer's data by comparing it with the initial state, if there are
  * differences, it updates the table's history and actions accordingly. If no changes are made,
  * it will retain the original state/actions/history.
  *
  * @param {Officer} data The new officer data to be applied to the row.
  * @param {Row<OfficerTableState>} row The row to update the officer state.
  */
  function editOfficer(data: Officer, row: Row<OfficerTableState>): void {
    const oldOfficer = row.original.old

    // set address to empty fields if not fully entered
    const addressSchema = getRequiredAddressSchema()
    const isMailingValid = (addressSchema.safeParse(data.mailingAddress)).success
    if (!isMailingValid) {
      data.mailingAddress = getNewOfficer().mailingAddress
    }

    const newState = JSON.parse(JSON.stringify({
      old: oldOfficer,
      new: data
    }))

    updateOfficerTable(newState, row)
    cancelOfficerEdit()
  }

  /**
  * Sets the forms default state and expands the appropriate row
  * @param {Row<OfficerTableState>} row The row to edit.
  */
  function initOfficerEdit(row: Row<OfficerTableState>): void {
    const officer = JSON.parse(JSON.stringify(row.original.new))
    editState.value = officer
    expanded.value = { [row.index]: true }
  }

  /**
  * Resets edit state and collapses table expansion
  */
  function cancelOfficerEdit(): void {
    expanded.value = undefined
    editState.value = {} as Officer
  }

  async function checkHasActiveForm(opt: 'save' | 'submit' | 'change') {
    if (addingOfficer.value || !isEmpty(editState.value)) {
      await na.callHook('app:officer-form:incomplete', {
        message: opt === 'save'
          ? t('text.finishTaskBeforeSave')
          : opt === 'submit'
            ? t('text.finishTaskBeforeSubmit')
            : t('text.finishTaskBeforeOtherChanges')
      })
      return true
    }
    return false
  }

  function checkHasChanges(when: 'save' | 'submit'): boolean {
    const tableState: OfficerTableState[] = JSON.parse(JSON.stringify(officerTableState.value))
    const tableOfficers = tableState.map(state => state.new)
    const currentOfficers = JSON.parse(JSON.stringify(initialOfficers.value))
    // check if the table state is different from the initial (current) officers
    if (when === 'save') {
      if (isEqual(tableOfficers, currentOfficers)) {
        return false
      }
      // Check if a draft exists and has any changes
      if (filingDraftState.value?.filing?.changeOfOfficers?.length) {
        const draftState: OfficersDraftFiling = JSON.parse(JSON.stringify(filingDraftState.value))
        const draftOfficers = draftState.filing.changeOfOfficers.map(state => state.new)

        // When saving, check if the table state or folio has changed from the draft
        return !isEqual(tableOfficers, draftOfficers) || draftState.filing.header.folioNumber !== folio.number
      }
    }
    // if no draft has been saved yet, compare against the original state.
    return !isEqual(tableOfficers, currentOfficers)
  }

  /**
  * Resets Officer store to default state
  */
  function $reset() {
    sessionStorage.removeItem('officer-store')
    initializing.value = false
    addingOfficer.value = false
    officerTableState.value = []
    expanded.value = undefined
    editState.value = {} as Officer
    initialOfficers.value = []
    folio.number = ''
    filingDraftState.value = {} as OfficersDraftFiling
  }

  return {
    officerTableState,
    initializing,
    addingOfficer,
    expanded,
    editState,
    disableActions,
    initialOfficers,
    folio,
    filingDraftState,
    init,
    addNewOfficer,
    editOfficer,
    updateOfficerTable,
    removeOfficer,
    undoOfficer,
    initOfficerEdit,
    cancelOfficerEdit,
    checkHasActiveForm,
    checkHasChanges,
    $reset
  }
})
