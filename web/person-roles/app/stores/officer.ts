import { FetchError } from 'ofetch'
import type { ExpandedState, Row } from '@tanstack/vue-table'
import { isEqual } from 'lodash'

export const useOfficerStore = defineStore('officer-store', () => {
  const t = useNuxtApp().$i18n.t
  const modal = useModals()
  const legalApi = useLegalApi()
  const authApi = useAuthApi()
  const detailsHeaderStore = useConnectDetailsHeaderStore()

  const initializing = ref<boolean>(false) // officer store loading state
  const addingOfficer = ref<boolean>(false) // flag to show/hide Add Officer form
  const initialOfficers = ref<Officer[]>([]) // officer state on page load
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

  async function initOfficerStore(businessId: string) {
    try {
      $reset() // reset any previous state (ex: user switches accounts)
      initializing.value = true
      detailsHeaderStore.loading = true

      const [authInfo, business, parties] = await Promise.all([
        authApi.getAuthInfo(businessId),
        legalApi.getBusiness(businessId, true),
        legalApi.getParties(businessId, 'officer')
      ])

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

      // map officers
      if (parties.length) {
        const officers = parties.map((p) => {
          const mailingAddress = formatAddressUi(p.mailingAddress)
          const deliveryAddress = formatAddressUi(p.deliveryAddress)
          const preferredName = '' // TODO: map preferred name - need in api

          return {
            firstName: p.officer.firstName ?? '',
            middleName: p.officer.middleInitial ?? '',
            lastName: p.officer.lastName ?? '',
            preferredName, // TODO: map preferred name - need in api
            roles: [], // TODO: map sub roles - need in api
            mailingAddress,
            deliveryAddress,
            sameAsDelivery: isEqual(mailingAddress, deliveryAddress),
            hasPreferredName: preferredName.length > 0
          }
        })

        initialOfficers.value = officers // retain initial officer state before changes

        // map officers data to display in table
        officerTableState.value = officers.map(o => ({
            state: {
              officer: o,
              actions: []
            },
            history: []
        }))
      }
    } catch (error) {
      if (error instanceof FetchError) { // handle http error
        const res = error.response
        const status = res?.status
        modal.openOfficerInitErrorModal(status)
      } else {
        modal.openOfficerInitErrorModal(undefined)
      }
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
    } else { // else add removed badge
      const newState = {
        state: {
          officer: initialState.officer,
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
    initialOfficers.value = []
    officerTableState.value = []
    expanded.value = undefined
    editState.value = {} as Officer
  }

  return {
    officerTableState,
    initializing,
    addingOfficer,
    expanded,
    editState,
    disableActions,
    hasChanges,
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
