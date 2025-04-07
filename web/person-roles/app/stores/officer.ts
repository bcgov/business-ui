import type { ExpandedState, Row } from '@tanstack/vue-table'
import { merge, isEqual } from 'lodash'

export const useOfficerStore = defineStore('officer-store', () => {
  // const t = useNuxtApp().$i18n.t

  const addingOfficer = ref<boolean>(false)

  const expanded = ref<ExpandedState | undefined>(undefined)
  const editState = ref<OfficerTableEditState>({} as OfficerTableEditState)

  const disableActions = computed(() => {
    return addingOfficer.value || !!expanded.value
  })

  const officers = ref<OfficerTableState[]>([
    {
      state: {
        officer: {
          firstName: 'Officer 1 first',
          middleName: 'Officer 1 middle',
          lastName: 'Officer 1 last',
          preferredName: '',
          roles: [OfficerRole.CEO],
          mailingAddress: {
            street: '260 Champ Ave',
            city: 'Vancouver',
            postalCode: 'G1J 4M6',
            country: 'CA',
            region: 'BC',
            streetAdditional: '',
            locationDescription: ''
          },
          deliveryAddress: {
            street: '264 Champ Ave',
            city: 'Vancouver',
            postalCode: 'G1J 4M6',
            country: 'CA',
            region: 'BC',
            streetAdditional: '',
            locationDescription: ''
          },
          sameAsDelivery: false,
          hasPreferredName: false
        },
        actions: []
      },
      history: []
    },
    {
      state: {
        officer: {
          firstName: 'Officer 2 first',
          middleName: 'Officer 2 middle',
          lastName: 'Officer 2 last',
          preferredName: 'Heisenberg',
          roles: [OfficerRole.CFO, OfficerRole.TREASURER],
          mailingAddress: {
            street: '260 Champ Ave',
            city: 'Vancouver',
            postalCode: 'G1J 4M6',
            country: 'CA',
            region: 'BC',
            streetAdditional: '',
            locationDescription: ''
          },
          deliveryAddress: {
            street: '260 Champ Ave',
            city: 'Vancouver',
            postalCode: 'G1J 4M6',
            country: 'CA',
            region: 'BC',
            streetAdditional: '',
            locationDescription: ''
          },
          sameAsDelivery: true,
          hasPreferredName: true
        },
        actions: []
      },
      history: []
    }
  ])

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

    officers.value = [
      ...officers.value,
      newState
    ]
  }

  function updateOfficers(
    data: Partial<Officer>,
    row: Row<OfficerTableState>,
    action: 'edit' | 'undo' | 'removed' | 'add'
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

    officers.value = [
      ...officers.value.slice(0, index),
      newState,
      ...officers.value.slice(index + 1)
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
    officers,
    addingOfficer,
    expanded,
    editState,
    disableActions,
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
