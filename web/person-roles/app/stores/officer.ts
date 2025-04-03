// import { z } from 'zod'

export const useOfficerStore = defineStore('officer-store', () => {
  // const t = useNuxtApp().$i18n.t

  const addingOfficer = ref<boolean>(false)
  const activeOfficer = ref<Officer | undefined>(undefined)

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
          }
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
          }
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
      }
    }
  }

  function addOfficer(v: Officer) {
    officers.value.push({
      state: {
        officer: v,
        badges: [{ label: 'ADDED' }]
      },
      history: []
    })
    addingOfficer.value = false
    activeOfficer.value = undefined
  }

  function $reset() {
    sessionStorage.removeItem('officer-store')
  }

  return {
    officers,
    activeOfficer,
    addingOfficer,
    getNewOfficer,
    addOfficer,
    $reset
  }
}
// { persist: true }
) // set has viewed in session storage to persist across page refreshes
