<script setup lang="ts">
import { h } from 'vue'
import type { FormSubmitEvent, TableColumn } from '@nuxt/ui'
import type { ExpandedState, Row } from '@tanstack/vue-table'
import { isEqual, merge } from 'lodash'

const { t } = useI18n()

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UButtonGroup = resolveComponent('UButtonGroup')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const ConnectAddressDisplay = resolveComponent('ConnectAddressDisplay')

const { officers } = storeToRefs(useOfficerStore())

function isRowRemoved(row: Row<OfficerTableState>) {
  return row.original.state.badges.some(b => b.label === 'REMOVED')
}

const columns: TableColumn<OfficerTableState>[] = [
  {
    id: 'name',
    header: 'Name',
    meta: {
      class: {
        td: 'pl-6 pr-2 py-4 font-bold min-w-48 max-w-48 whitespace-normal',
        th: 'pl-6'
      }
    },
    cell: ({ row }) => {
      const officer = row.original.state.officer
      const badges = row.original.state.badges
      const name = `${officer.firstName} ${officer.middleName} ${officer.lastName}`
      const containerClass = isRowRemoved(row) ? 'opacity-50 flex flex-col gap-2' : 'flex flex-col gap-2'

      return h('div', { class: containerClass }, [
        h('span', {}, name),
        badges.length
          ? h('ul', { class: 'flex flex-col gap-2' },
              badges.map(badge =>
                h(UBadge, {
                  as: 'li',
                  class: 'w-min',
                  key: badge.label,
                  ...badge
                })
              )
          )
          : null
      ])
    }
  },
  {
    id: 'roles',
    header: 'Roles',
    meta: {
      class: {
        td: 'px-2 py-4'
      }
    },
    cell: ({ row }) => {
      const roles = row.original.state.officer.roles
      const containerClass = isRowRemoved(row) ? 'opacity-50 flex flex-col gap-1' : 'flex flex-col gap-1'

      return roles.length
        ? h('ul', { class: containerClass },
            roles.map(role =>
              h('li', {}, t(`enum.officerRole.${role}`))
            )
        )
        : null
    }
  },
  {
    id: 'mailingAddress',
    header: 'Mailing Address',
    meta: {
      class: {
        td: 'px-2 py-4'
      }
    },
    cell: ({ row }) => {
      const address = row.original.state.officer.mailingAddress
      const containerClass = isRowRemoved(row) ? 'opacity-50' : ''
      return h('div', { class: containerClass }, h(ConnectAddressDisplay, { address }))
    }
  },
  {
    id: 'deliveryAddress',
    header: 'Delivery Address',
    meta: {
      class: {
        td: 'px-2 py-4'
      }
    },
    cell: ({ row }) => {
      const mailingAddress = row.original.state.officer.mailingAddress
      const deliveryAddress = row.original.state.officer.deliveryAddress
      const containerClass = isRowRemoved(row) ? 'opacity-50' : ''
      return h('div', { class: containerClass }, h(isEqual(mailingAddress, deliveryAddress)
        ? h('span', {}, t('label.sameAsMailAddress'))
        : h(ConnectAddressDisplay, { address: deliveryAddress })
      ))
    }
  },
  {
    id: 'actions',
    meta: {
      class: {
        td: 'pl-2 py-4 pr-6 ml-auto',
        th: 'pr-6'
      }
    },
    cell: ({ row }) => {
      const isRemoved = row.original.state.badges.some(b => b.label === 'REMOVED')
      return h(
        'div',
        { class: 'flex justify-end' },
        [
          h(
            UButtonGroup,
            {},
            {
              default: () => [
                h(UButton, {
                  variant: 'ghost',
                  label: isRemoved ? 'Undo' : 'Remove',
                  icon: isRemoved ? 'i-mdi-undo' : 'i-mdi-delete',
                  class: 'px-4',
                  onClick: () => isRemoved ? updateOfficers({}, row, 'undo') : updateOfficers({}, row, 'removed')
                }),
                isRemoved
                  ? null
                  : h(UDropdownMenu, {
                    items: getRowActions(row),
                    content: { align: 'end' }
                  }, {
                    default: () =>
                      h(UButton, {
                        'variant': 'ghost',
                        'icon': 'i-mdi-caret-down',
                        'class': 'px-4',
                        'aria-label': 'More Actions'
                      })
                  })
              ]
            }
          )
        ]
      )
    }
  }
]

const expanded = ref<ExpandedState | undefined>(undefined)
const editState = ref<OfficerTableEditState>({} as OfficerTableEditState)

function initRowEdit(row: Row<OfficerTableState>, section: OfficerTableEditSection) {
  const officer = JSON.parse(JSON.stringify(row.original.state.officer))

  const sectionMap: Record<OfficerTableEditSection, Partial<Officer>> = {
    name: {
      firstName: officer.firstName,
      middleName: officer.middleName,
      lastName: officer.lastName
    },
    roles: {
      roles: officer.roles
    },
    address: {
      mailingAddress: officer.mailingAddress,
      deliveryAddress: officer.deliveryAddress
    }
  }

  editState.value = {
    data: sectionMap[section],
    section
  }

  expanded.value = { [row.index]: true }
}

function cancelRowEdit() {
  expanded.value = undefined
  editState.value = {} as OfficerTableEditState
}

function updateOfficers(data: Partial<Officer>, row: Row<OfficerTableState>, action: 'edit' | 'undo' | 'removed') {
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

async function onRowEditSubmit(event: FormSubmitEvent<any>, row: Row<OfficerTableState>) {
  updateOfficers(event.data, row, 'edit')

  cancelRowEdit()
}

function getRowActions(row: Row<OfficerTableState>) {
  const actions = [
    {
      label: 'Change Legal Name',
      onSelect: () => initRowEdit(row, 'name')
    },
    {
      label: 'Change Roles',
      onSelect: () => initRowEdit(row, 'roles')
    },
    {
      label: 'Change Address',
      onSelect: () => initRowEdit(row, 'address')
    }
  ]

  if (row.original.history.length) {
    actions.unshift({
      label: 'Undo',
      onSelect: () => updateOfficers({}, row, 'undo')
    })
  }

  return actions
}
</script>

<template>
  <UTable
    v-model:expanded="expanded"
    :data="officers"
    :columns="columns"
    class="flex-1 max-w-[945px] mx-auto"
    sticky
    :ui="{
      root: 'bg-white rounded-sm ring ring-gray-200',
      tbody: 'px-10',
      th: 'bg-bcGovColor-gray2 px-2',
      td: 'px-0 py-0 text-bcGovGray-700 align-top'
    }"
  >
    <template #expanded="{ row }">
      <FormOfficerChange
        :default-state="editState.data"
        :editing="true"
        @cancel="cancelRowEdit"
        @submit.prevent="onRowEditSubmit($event, row)"
      />
    </template>
  </UTable>

  <pre>{{ officers }}</pre>
</template>
