import { FetchError } from 'ofetch'
import type { ExpandedState, Row } from '@tanstack/vue-table'
import { merge, isEqual } from 'lodash'

export const useOfficerStore = defineStore('officer-store', () => {
  const t = useNuxtApp().$i18n.t
  const modal = useModals()
  const legalApi = useLegalApi()
  const authApi = useAuthApi()
  const detailsHeaderStore = useConnectDetailsHeaderStore()

  const initializing = ref<boolean>(false)
  const addingOfficer = ref<boolean>(false)

  const expanded = ref<ExpandedState | undefined>(undefined)
  const editState = ref<Officer>({} as Officer)

  const disableActions = computed(() => addingOfficer.value || !!expanded.value || initializing.value)

  const initialOfficers = ref<Officer[]>([])
  const officerTableState = ref<OfficerTableState[]>([])

  async function initOfficerStore(businessId: string) {
    try {
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
            middleName: p.officer.middleName ?? '',
            lastName: p.officer.lastName ?? '',
            preferredName, // TODO: map preferred name - need in api
            roles: [], // TODO: map sub roles - need in api
            mailingAddress,
            deliveryAddress,
            sameAsDelivery: isEqual(mailingAddress, deliveryAddress),
            hasPreferredName: preferredName.length > 0
          }
        })

        initialOfficers.value = officers
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

  function getOfficerStateDiff(oldVal: Officer, newVal: Officer) {
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

      const sectionDiffs = getOfficerStateDiff(initialState.officer, newOfficer)

      let newActions = [...initialState.actions, ...sectionDiffs]
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

  function initOfficerEdit(row: Row<OfficerTableState>) {
    const officer = JSON.parse(JSON.stringify(row.original.state.officer))
    editState.value = officer
    expanded.value = { [row.index]: true }
  }

  function cancelOfficerEdit() {
    expanded.value = undefined
    editState.value = {} as Officer
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
    initializing,
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
