import type { ExpandedState, Row } from '@tanstack/vue-table'
import { merge } from 'lodash'

export const useOfficerStore = defineStore('officer-store', () => {
  // const t = useNuxtApp().$i18n.t

  const addingOfficer = ref<boolean>(false)

  const expanded = ref<ExpandedState | undefined>(undefined)
  const editState = ref<OfficerTableEditState>({} as OfficerTableEditState)

  const officers = ref<OfficerTableState[]>([
    {
      state: {
        officer: {
          firstName: 'Officer 1 first',
          middleName: 'Officer 1 middle',
          lastName: 'Officer 1 last',
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
          sameAsMailing: false
        },
        badges: []
      },
      history: []
    },
    {
      state: {
        officer: {
          firstName: 'Officer 2 first',
          middleName: 'Officer 2 middle',
          lastName: 'Officer 2 last',
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
          sameAsMailing: true
        },
        badges: []
      },
      history: []
    }
  ])

  function getNewOfficer(): Officer {
    return {
      firstName: '',
      middleName: '',
      lastName: '',
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
      sameAsMailing: false
    }
  }

  function addNewOfficer(v: Officer) {
    const newState = {
      state: {
        officer: v,
        badges: getOfficerTableBadges([], 'added')
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
      const newOfficer = merge({}, initialState.officer, data)
      const newBadges = getOfficerTableBadges(initialState.badges, editState.value.section)
      newState = {
        state: {
          officer: newOfficer,
          badges: newBadges
        },
        history: [...initialHistory, initialState]
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
      const newBadges = getOfficerTableBadges(initialState.badges, 'removed')
      newState = {
        state: {
          officer: initialState.officer,
          badges: newBadges
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

  function $reset() {
    sessionStorage.removeItem('officer-store')
  }

  return {
    officers,
    addingOfficer,
    expanded,
    editState,
    getNewOfficer,
    addNewOfficer,
    updateOfficers,
    $reset
  }
}
// { persist: true }
) // set has viewed in session storage to persist across page refreshes
