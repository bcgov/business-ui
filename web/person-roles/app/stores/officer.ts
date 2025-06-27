import type { ExpandedState, Row } from '@tanstack/vue-table'
import { isEqual } from 'lodash'

export const useOfficerStore = defineStore('officer-store', () => {
  const t = useNuxtApp().$i18n.t
  const rtc = useRuntimeConfig().public
  const modal = useModal()
  const legalApi = useLegalApi()
  const authApi = useAuthApi()
  const accountStore = useConnectAccountStore()
  const detailsHeaderStore = useConnectDetailsHeaderStore()

  // let initialOfficersRaw: OrgPerson[] = [] // raw officer response on page load/parties fetch

  const activeBusiness = shallowRef<BusinessData>({} as BusinessData)
  const initializing = ref<boolean>(false) // officer store loading state
  const addingOfficer = ref<boolean>(false) // flag to show/hide Add Officer form
  const initialOfficers = shallowRef<Officer[]>([]) // officer state on page load
  const officerTableState = ref<OfficerTableState[]>([]) // officer state displayed in table
  const expanded = ref<ExpandedState | undefined>(undefined) // what table rows are expanded
  const editState = ref<Officer>({} as Officer) // default state passed to officer form in edit mode

  const disableActions = computed(() => addingOfficer.value || !!expanded.value || initializing.value)
  const hasChanges = computed(() => {
    const tableOfficers = officerTableState.value.map(state => state.state.officer)
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
            'error.getDraftFiling',
            [{ label: t('btn.goToBRD'), to: `${rtc.brdUrl}account/${accountStore.currentAccount.id}` }]
          )
          return
        }
      }

      // get full business data
      // get business pending tasks
      const [business, hasPendingTasks] = await Promise.all([
        legalApi.getBusiness(businessId),
        legalApi.hasPendingTasks(businessId)
      ])

      // set business ref
      activeBusiness.value = business

      // if ***NO*** filing ID provided validate business is allowed to complete this filing type
      // return early if the filing is not allowed or the business has pending tasks
      const isFilingAllowed = validateBusinessAllowedFilings(business, 'changeOfOfficers')
      if ((!isFilingAllowed || hasPendingTasks) && !draftId) {
        modal.openBaseErrorModal(
          undefined,
          'error.filingNotAllowed',
          [{ label: t('btn.goToBRD'), to: `${rtc.brdUrl}account/${accountStore.currentAccount.id}` }]
        )
        return
      }

      // get business auth info for masthead and filing paylaod
      // load current business officers
      const [authInfo, parties] = await Promise.all([
        authApi.getAuthInfo(businessId),
        legalApi.getParties(businessId, { classType: 'officer' })
      ])

      // initialOfficersRaw = parties

      // set masthead data
      const contact = authInfo.contacts[0]
      const ext = contact?.extension ?? contact?.phoneExtension
      const phoneLabel = ext ? `${contact?.phone ?? ''} Ext: ${ext}` : contact?.phone ?? ''

      detailsHeaderStore.title = { el: 'span', text: business.legalName }
      detailsHeaderStore.subtitles = [{ text: authInfo.corpType.desc }]
      detailsHeaderStore.sideDetails = [
        { label: t('label.businessNumber'), value: business.taxId ?? '' },
        { label: t('label.incorporationNumber'), value: business.identifier },
        { label: t('label.email'), value: contact?.email ?? '' },
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
      modal.openBaseErrorModal(
        error,
        'error.initOfficerStore',
        [{ label: t('btn.goToBRD'), to: `${rtc.brdUrl}account/${accountStore.currentAccount.id}` }]
      )
    } finally {
      detailsHeaderStore.loading = false
      initializing.value = false
    }
  }

  /**
  *  Returns an empty officer object
  *  @returns Officer
  */
  function getNewOfficer(): Officer {
    return {
      firstName: '',
      middleName: '',
      lastName: '',
      preferredName: '',
      roles: [],
      mailingAddress: {
        street: '',
        streetAdditional: '',
        city: '',
        region: '',
        postalCode: '',
        country: 'CA',
        locationDescription: ''
      },
      deliveryAddress: {
        street: '',
        streetAdditional: '',
        city: '',
        region: '',
        postalCode: '',
        country: 'CA',
        locationDescription: ''
      },
      sameAsDelivery: false,
      hasPreferredName: false
    }
  }

  /**
  *  Returns an array of differences in officer state by section (name, roles, address)
  *  @param {Officer} oldVal Previous Officer State
  *  @param {Officer} newVal New Officer State
  *  @returns {OfficerTableEditSection[]} ex: ['roles', 'address']
  */
  function getOfficerStateDiff(oldVal: Officer, newVal: Officer): OfficerTableEditSection[] {
    const oldMap: Record<OfficerTableEditSection, Partial<Officer>> = {
      name: {
        firstName: oldVal.firstName,
        middleName: oldVal.middleName,
        lastName: oldVal.lastName,
        preferredName: oldVal.preferredName,
        hasPreferredName: oldVal.hasPreferredName
      },
      roles: {
        roles: oldVal.roles
      },
      address: {
        mailingAddress: oldVal.mailingAddress,
        deliveryAddress: oldVal.deliveryAddress,
        sameAsDelivery: oldVal.sameAsDelivery
      }
    }
    const newMap: Record<OfficerTableEditSection, Partial<Officer>> = {
      name: {
        firstName: newVal.firstName,
        middleName: newVal.middleName,
        lastName: newVal.lastName,
        preferredName: newVal.preferredName,
        hasPreferredName: newVal.hasPreferredName
      },
      roles: {
        roles: newVal.roles
      },
      address: {
        mailingAddress: newVal.mailingAddress,
        deliveryAddress: newVal.deliveryAddress,
        sameAsDelivery: newVal.sameAsDelivery
      }
    }

    const changedSections: OfficerTableEditSection[] = []

    for (const section in oldMap) {
      const s = section as OfficerTableEditSection
      if (!isEqual(oldMap[s], newMap[s])) {
        changedSections.push(s)
      }
    }

    return changedSections
  }

  /**
  *  Adds a 'net new' officer object to the table state
  *  @param {Officer} v The new officer object
  */
  function addNewOfficer(v: Officer): void {
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
    const initialHistory = row.original.history
    const previousState = initialHistory[initialHistory.length - 1]

      if (previousState) {
        const newHistory = initialHistory.slice(0, initialHistory.length - 1)
        const newState = {
          state: previousState,
          history: newHistory
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
    activeBusiness.value = {} as BusinessData

    initialOfficers.value = []
    // initialOfficersRaw = []
  }

  return {
    officerTableState,
    initializing,
    addingOfficer,
    activeBusiness,
    expanded,
    editState,
    disableActions,
    hasChanges,
    initialOfficers,
    initOfficerStore,
    getNewOfficer,
    addNewOfficer,
    editOfficer,
    updateOfficerTable,
    removeOfficer,
    undoOfficer,
    initOfficerEdit,
    cancelOfficerEdit,
    $reset
  }
}
// { persist: true }
) // set has viewed in session storage to persist across page refreshes
