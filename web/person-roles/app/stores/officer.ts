import type { ExpandedState, Row } from '@tanstack/vue-table'
import { isEqual } from 'lodash'
import { FetchError } from 'ofetch'

export const useOfficerStore = defineStore('officer-store', () => {
  const na = useNuxtApp()
  const t = na.$i18n.t
  const rtc = useRuntimeConfig().public
  const modal = useModal()
  const legalApi = useLegalApi()
  const authApi = useAuthApi()
  const accountStore = useConnectAccountStore()
  const detailsHeaderStore = useConnectDetailsHeaderStore()

  const activeBusiness = shallowRef<BusinessData>({} as BusinessData)
  const initializing = ref<boolean>(false) // officer store loading state
  const addingOfficer = ref<boolean>(false) // flag to show/hide Add Officer form
  const initialOfficers = shallowRef<Officer[]>([]) // officer state on page load
  const officerTableState = ref<OfficerTableState[]>([]) // officer state displayed in table
  const officerDraftTableState = shallowRef<OfficerTableState[]>([]) // officer state saved as draft
  const expanded = ref<ExpandedState | undefined>(undefined) // what table rows are expanded
  const editState = ref<Officer>({} as Officer) // default state passed to officer form in edit mode

  const disableActions = computed(() => addingOfficer.value || !!expanded.value || initializing.value)
  const hasChanges = computed(() => {
    const tableOfficers = officerTableState.value.map(state => state.state.officer)
    const tableOfficersDraft = officerDraftTableState.value.map(state => state.state.officer)

    if (tableOfficersDraft.length) {
      return !isEqual(tableOfficers, tableOfficersDraft)
    }

    const hasEdits = officerTableState.value.some(o => o.state.actions.length > 0)
    const hasNew = tableOfficers.length !== initialOfficers.value.length
    return hasEdits || hasNew
  })

  async function initOfficerStore(businessId: string, draftId?: string) {
    try {
      // reset any previous state (ex: user switches accounts) and init loading state
      $reset()
      initializing.value = true
      detailsHeaderStore.loading = true

      // if filing ID provided, get and validate the filing structure, return early if invalid
      let draftState: OfficerTableState[] = []
      if (draftId) {
        try {
          const { isValid, data } = await legalApi.getAndValidateDraftFiling<'changeOfOfficers', OfficerTableState[]>(
            businessId,
            draftId,
            'changeOfOfficers'
          )
          if (!isValid) {
            throw new Error('Draft filing invalid')
          } else {
            draftState = data?.filing.changeOfOfficers || []
          }
        } catch (error) {
          modal.openBaseErrorModal(
            error,
            'modal.error.getDraftFiling',
            [
              {
                label: t('btn.goBack'),
                to: `${rtc.businessDashboardUrl + businessId}?accountid=${accountStore.currentAccount.id}`,
                variant: 'outline'
              },
              { label: t('btn.refreshPage'), onClick: () => window.location.reload() }
            ]
          )
          return
        }
      }

      // get full business data
      // get business pending tasks
      const [business, pendingTask] = await Promise.all([
        legalApi.getBusiness(businessId),
        legalApi.getPendingTask(businessId, 'filing')
      ])

      // set business ref
      activeBusiness.value = business

      // if ***NO*** filing ID provided validate business is allowed to complete this filing type
      // return early if the filing is not allowed or the business has pending tasks
      const isFilingAllowed = validateBusinessAllowedFilings(business, 'changeOfOfficers')
      if ((!isFilingAllowed || pendingTask !== undefined) && !draftId) { // TODO: maybe update the draft id check to compare the pending task and filing name and status ??
        modal.openBaseErrorModal(
          undefined,
          'modal.error.filingNotAllowed',
          [
            {
              label: t('btn.goBack'),
              to: `${rtc.businessDashboardUrl + businessId}?accountid=${accountStore.currentAccount.id}`,
              variant: 'outline'
            },
            { label: t('btn.refreshPage'), onClick: () => window.location.reload() }
          ]
        )
        return
      }

      // get business auth info for masthead
      // get current business officers
      const [authInfo, parties] = await Promise.all([
        authApi.getAuthInfo(businessId),
        legalApi.getParties(businessId, { classType: 'officer' })
      ])

      // set masthead data
      const contact = authInfo.contacts[0]
      const ext = contact?.extension || contact?.phoneExtension
      const phoneLabel = ext ? `${contact?.phone || ''} Ext: ${ext}` : contact?.phone || t('label.notAvailable')

      detailsHeaderStore.title = { el: 'span', text: business.legalName }
      detailsHeaderStore.subtitles = [{ text: authInfo.corpType.desc }]
      detailsHeaderStore.sideDetails = [
        { label: t('label.businessNumber'), value: business.taxId ?? t('label.notAvailable') },
        { label: t('label.incorporationNumber'), value: business.identifier },
        { label: t('label.email'), value: contact?.email || t('label.notAvailable') },
        { label: t('label.phone'), value: phoneLabel }
      ]

      // map current officers
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

      initialOfficers.value = officers // retain initial officer state before changes

      // set table to returned draft state if exists
      if (draftId && draftState.length) {
        officerTableState.value = draftState
        officerDraftTableState.value = draftState
        return
      }

      // map intitial officers data to display in table if no draft officers
      officerTableState.value = officers.map(o => ({
          state: {
            officer: o,
            actions: []
          },
          history: []
      }))
    } catch (error) {
      const status = error instanceof FetchError
        ? error.response?.status
        : undefined
      const isUnauthorized = status && [401, 403].includes(status)
      modal.openBaseErrorModal(
        error,
        'modal.error.initOfficerStore',
        isUnauthorized
          ? [{ label: t('btn.goToMyBusinessRegistry'), to: `${rtc.brdUrl}account/${accountStore.currentAccount.id}` }]
          : [
              {
                label: t('btn.goBack'),
                to: `${rtc.businessDashboardUrl + businessId}?accountid=${accountStore.currentAccount.id}`,
                variant: 'outline'
              },
              { label: t('btn.refreshPage'), onClick: () => window.location.reload() }
            ]
      )
    } finally {
      detailsHeaderStore.loading = false
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

    const newState: OfficerTableState = {
      state: {
        officer: v,
        actions: ['added']
      },
      history: []
    }

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
    const initialState = row.original.state
    const initialHistory = row.original.history

    // delete newly added officer from table
    if (initialState.actions.includes('added')) {
      officerTableState.value = [
        ...officerTableState.value.slice(0, row.index),
        ...officerTableState.value.slice(row.index + 1)
      ]
    } else { // else add removed badge and add cessation date to roles
      const todayUtc = getToday()
      const officerToRemove = initialState.officer

      const ceasedRoles: OfficerRoleObj[] = officerToRemove.roles.map(role => ({
          ...role,
          cessationDate: todayUtc
      }))

      const newState = {
        state: {
          officer: { ...officerToRemove, roles: ceasedRoles },
          actions: [...initialState.actions, 'removed' as OfficerFormAction]
        },
        history: [...initialHistory, initialState]
      }

      updateOfficerTable(newState, row)
    }
  }

  /**
  *  Undoes the most recent change by resetting the officer's state
  *  to the previous state in the history array at the given row
  *  @param {Row<OfficerTableState>} row The row to undo
  */
  function undoOfficer(row: Row<OfficerTableState>): void {
    // undo all edits, can use commented code to undo individual edits if required
    const initialHistory = row.original.history
    // leaving this in for now, could use this instead to undo each individual action
    // const previousState = initialHistory[initialHistory.length - 1]
    const previousState = initialHistory[0]

      if (previousState) {
        // same here
        // const newHistory = initialHistory.slice(0, initialHistory.length - 1)
        const newState = {
          state: previousState,
          history: [] // newHistory
        }
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
    const initialState = row.original.state
    const initialHistory = row.original.history

    // get any changed sections between new/old state
    const sectionDiffs = getOfficerStateDiff(initialState.officer, data)

    // return early if no changes made
    if (!sectionDiffs.length) {
      cancelOfficerEdit()
      return
    }

    // set address to empty fields if not fully entered
    const addressSchema = getRequiredAddressSchema()
    const isMailingValid = (addressSchema.safeParse(data.mailingAddress)).success
    if (!isMailingValid) {
      data.mailingAddress = getNewOfficer().mailingAddress
    }

    const newState = {
      state: {
        officer: data,
        actions: [...initialState.actions, ...sectionDiffs]
      },
      history: [...initialHistory, initialState]
    }

    updateOfficerTable(newState, row)
    cancelOfficerEdit()
  }

  /**
  * Sets the forms default state and expands the appropriate row
  * @param {Row<OfficerTableState>} row The row to edit.
  */
  function initOfficerEdit(row: Row<OfficerTableState>): void {
    const officer = JSON.parse(JSON.stringify(row.original.state.officer))
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

  /**
  * Resets Officer store to default state
  */
  function $reset() {
    sessionStorage.removeItem('officer-store')
    initializing.value = false
    addingOfficer.value = false
    officerTableState.value = []
    officerDraftTableState.value = []
    expanded.value = undefined
    editState.value = {} as Officer
    activeBusiness.value = {} as BusinessData

    initialOfficers.value = []
  }

  return {
    officerTableState,
    officerDraftTableState,
    initializing,
    addingOfficer,
    activeBusiness,
    expanded,
    editState,
    disableActions,
    hasChanges,
    initialOfficers,
    initOfficerStore,
    addNewOfficer,
    editOfficer,
    updateOfficerTable,
    removeOfficer,
    undoOfficer,
    initOfficerEdit,
    cancelOfficerEdit,
    checkHasActiveForm,
    $reset
  }
})
