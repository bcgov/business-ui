import { z } from 'zod'

type OfficerTableState = {
  officer: Officer
  history: Officer[]
}

export const useOfficerStore = defineStore('officer-store', () => {
  const t = useNuxtApp().$i18n.t

  const addingOfficer = ref<boolean>(false)
  const activeOfficer = ref<Officer | undefined>(undefined)
  const newOfficers = ref<OfficerTableState[]>([])

  const originalOfficerState: OfficerTableState[] = [
  {
    officer: {
      firstName: 'Officer 1',
      middleName: 'Officer 1',
      lastName: 'Officer 1',
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
      history: []
    },
    {
      officer: {
        firstName: 'Officer 2',
        middleName: 'Officer 2',
        lastName: 'Officer 2',
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
      history: []
    }
  ]

  const displayedOfficerState = computed(() => {
    return [...originalOfficerState, ...newOfficers.value]
  })

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

  const officerNameSchema = z.object({
    first: z.string().optional(),
    middle: z.string().optional(),
    last: z.string().min(2)
  })

  const officerRoleSchema = z.object({
    first: z.string().optional(),
    middle: z.string().optional(),
    last: z.string().min(2)
  })

  const officerSchema = z.object({
    mailingAddress: getRequiredAddress(
      t('validation.address.street'),
      t('validation.address.city'),
      t('validation.address.region'),
      t('validation.address.postalCode'),
      t('validation.address.country')
    ),
    deliveryAddress: getRequiredAddress(
      t('validation.address.street'),
      t('validation.address.city'),
      t('validation.address.region'),
      t('validation.address.postalCode'),
      t('validation.address.country')
    )
  })

  function initNewOfficer() {
    activeOfficer.value = getNewOfficer()
    addingOfficer.value = true
  }

  function addOfficer(v: Officer) {
    newOfficers.value.push({
      officer: v,
      history: []
    })
    addingOfficer.value = false
    activeOfficer.value = undefined
  }

  function $reset() {
    sessionStorage.removeItem('officer-store')
  }

  return {
    displayedOfficerState,
    activeOfficer,
    newOfficers,
    addingOfficer,
    initNewOfficer,
    getNewOfficer,
    addOfficer,
    $reset
  }
}
// { persist: true }
) // set has viewed in session storage to persist across page refreshes
