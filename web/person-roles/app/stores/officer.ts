import type { ExpandedState, Row } from '@tanstack/vue-table'
import { merge, isEqual } from 'lodash'

export const useOfficerStore = defineStore('officer-store', () => {
  // const t = useNuxtApp().$i18n.t
  const legalApi = useLegalApi()
  const authApi = useAuthApi()
  const detailsHeaderStore = useConnectDetailsHeaderStore()

  const loading = ref<boolean>(false)
  const addingOfficer = ref<boolean>(false)

  const expanded = ref<ExpandedState | undefined>(undefined)
  const editState = ref<OfficerTableEditState>({} as OfficerTableEditState)

  const disableActions = computed(() => addingOfficer.value || !!expanded.value)

  const initialOfficers = ref<Officer[]>([])
  const officerTableState = ref<OfficerTableState[]>([])

  async function initOfficerStore(businessId: string) {
    loading.value = true
    detailsHeaderStore.loading = true

    const [authInfo, business, parties] = await Promise.all([
      authApi.getAuthInfo(businessId),
      legalApi.getBusiness('BC1239315', true),
      legalApi.getParties('BC1239315', 'officer')
    ])

    // set masthead data
    const contact = authInfo.contacts[0]
    const ext = contact?.extension ?? contact?.phoneExtension
    const phoneLabel = ext ? `${contact?.phone ?? ''} Ext: ${ext}` : contact?.phone ?? ''

    detailsHeaderStore.title = { el: 'span', text: business.legalName }
    detailsHeaderStore.subtitles = [{ text: authInfo.corpType.desc }]
    detailsHeaderStore.sideDetails = [
      { label: 'Business Number', value: business.taxId ?? '' },
      { label: 'Incorporation Number', value: business.identifier },
      { label: 'Email', value: contact?.email ?? '' },
      { label: 'Phone', value: phoneLabel }
    ]

    // map officers
    if (parties.length) {
      const officers = parties.map((p) => {
        const mailingAddress = formatAddressUi(p.mailingAddress)
        const deliveryAddress = formatAddressUi(p.deliveryAddress)
        const preferredName = '' // TODO: map preferred name - need in api

        return {
          firstName: p.officer.firstName ?? '',
          middleName: p.officer.middleName ?? '',
          lastName: p.officer.lastName ?? '',
          preferredName, // TODO: map preferred name - need in api
          roles: p.roles.map(r => r.roleType),
          mailingAddress,
          deliveryAddress,
          sameAsDelivery: isEqual(mailingAddress, deliveryAddress),
          hasPreferredName: preferredName.length > 0
        }
      })

      // @ts-expect-error - // TODO: roletype not matching - update when roles are defined in api
      initialOfficers.value = officers
      // @ts-expect-error - // TODO: roletype not matching - update when roles are defined in api
      officerTableState.value = officers.map(o => ({
          state: {
            officer: o,
            actions: []
          },
          history: []
      }))
    }

    detailsHeaderStore.loading = false
    loading.value = false
  }

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

  function addNewOfficer(v: Officer) {
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

  function updateOfficers(
    data: Partial<Officer>,
    row: Row<OfficerTableState>,
    action: 'edit' | 'undo' | 'removed'
  ) {
    const index = row.index
    const initialState = row.original.state
    const initialHistory = row.original.history

    let newState: OfficerTableState = {} as OfficerTableState

    if (action === 'edit') {
      let newOfficer = merge({}, initialState.officer, data)
      let newActions = [...initialState.actions, editState.value.section]
      let newHistory = [...initialHistory, initialState]

      if (isEqual(initialState.officer, newOfficer)) {
        newOfficer = initialState.officer
        newActions = initialState.actions
        newHistory = initialHistory
      }

      newState = {
        state: {
          officer: newOfficer,
          actions: newActions
        },
        history: newHistory
      }
    } else if (action === 'undo') {
      const previousState = initialHistory[initialHistory.length - 1]
      if (previousState) {
        const newHistory = initialHistory.slice(0, initialHistory.length - 1)
        newState = {
          state: previousState,
          history: newHistory
        }
      }
    } else if (action === 'removed') {
      newState = {
        state: {
          officer: initialState.officer,
          actions: [...initialState.actions, 'removed']
        },
        history: [...initialHistory, initialState]
      }
    }

    officerTableState.value = [
      ...officerTableState.value.slice(0, index),
      newState,
      ...officerTableState.value.slice(index + 1)
    ]
  }

  function initOfficerEdit(row: Row<OfficerTableState>, section: OfficerTableEditSection) {
    const officer = JSON.parse(JSON.stringify(row.original.state.officer))

    const sectionMap: Record<OfficerTableEditSection, Partial<Officer>> = {
      name: {
        firstName: officer.firstName,
        middleName: officer.middleName,
        lastName: officer.lastName,
        preferredName: officer.preferredName,
        hasPreferredName: officer.hasPreferredName
      },
      roles: {
        roles: officer.roles
      },
      address: {
        mailingAddress: officer.mailingAddress,
        deliveryAddress: officer.deliveryAddress,
        sameAsDelivery: officer.sameAsDelivery
      }
    }

    editState.value = {
      data: sectionMap[section],
      section
    }

    expanded.value = { [row.index]: true }
  }

  function cancelOfficerEdit() {
    expanded.value = undefined
    editState.value = {} as OfficerTableEditState
  }

  async function onOfficerEditSubmit(data: Partial<Officer>, row: Row<OfficerTableState>) {
    updateOfficers(data, row, 'edit')

    cancelOfficerEdit()
  }

  function $reset() {
    sessionStorage.removeItem('officer-store')
  }

  return {
    officerTableState,
    loading,
    addingOfficer,
    expanded,
    editState,
    disableActions,
    initOfficerStore,
    getNewOfficer,
    addNewOfficer,
    updateOfficers,
    initOfficerEdit,
    cancelOfficerEdit,
    onOfficerEditSubmit,
    $reset
  }
}
// { persist: true }
) // set has viewed in session storage to persist across page refreshes
