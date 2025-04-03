<script setup lang="ts">
import { h } from 'vue'
import type { FormSubmitEvent, TableColumn } from '@nuxt/ui'
import type { ExpandedState, Row } from '@tanstack/vue-table'
import { isEqual, merge } from 'lodash'

const UBadge = resolveComponent('UBadge')

const { officers } = storeToRefs(useOfficerStore())

const columns: TableColumn<OfficerTableState>[] = [
  {
    id: 'name',
    header: 'Name',
    meta: {
      class: {
        td: 'pl-6 font-bold min-w-48 max-w-48 whitespace-normal',
        th: 'pl-6'
      }
    },
    cell: ({ row }) => {
      const officer = row.original.state.officer
      const badges = row.original.state.badges

      return h('div', { class: 'flex flex-col gap-2' }, [
        h('span', {}, officer.firstName),
        badges.length
          ? h('ul', { class: 'flex flex-col gap-2' },
              badges.map(badge =>
                h(UBadge, {
                  as: 'li',
                  label: badge.label,
                  class: 'w-min',
                  key: badge.label
                })
              )
          )
          : null
      ])
    }
  },
  {
    id: 'roles',
    header: 'Roles'
  },
  {
    id: 'mailingAddress',
    header: 'Mailing Address'
  },
  {
    id: 'deliveryAddress',
    header: 'Delivery Address'
  },
  {
    id: 'actions',
    meta: {
      class: {
        td: 'pr-6 ml-auto',
        th: 'pr-6'
      }
    }
  }
]

const expanded = ref<ExpandedState | undefined>(undefined)
const editState = ref({})

function initRowEdit(row: Row<OfficerTableState>, section: 'name' | 'roles' | 'address') {
  const officer = JSON.parse(JSON.stringify(row.original.state.officer))

  const sectionMap: Record<string, Partial<Officer>> = {
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

  editState.value = sectionMap[section] || {}

  expanded.value = { [row.index]: true }
}

function cancelRowEdit() {
  expanded.value = undefined
  editState.value = {}
}

function updateOfficers(data: Partial<OfficerTableState>, row: Row<OfficerTableState>, action: 'edit' | 'undo') {
  const index = row.index
  const initialState = row.original.state
  const initialHistory = row.original.history

  let newState: OfficerTableState = {} as OfficerTableState

  if (action === 'edit') {
    const newBadgeLabel = 'firstName' in data ? 'CHANGED NAME' : 'roles' in data ? 'CHANGED ROLES' : 'CHANGED ADDRESS'
    const newOfficer = merge({}, initialState.officer, data)
    const newBadges = [...initialState.badges, { label: newBadgeLabel }]
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
  <!-- eslint-disable -->
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
      td: 'px-2 text-bcGovGray-700 align-top'
    }"
  >
    <!-- <template #name-cell="{ row }">
      <div class="flex flex-col gap-2">
        <span>{{ row.original.state.officer.firstName }}</span>
        <ul v-if="row.original.state.badges.length" class="flex flex-col gap-2">
          <UBadge 
            v-for="badge in row.original.state.badges" 
            :key="badge.label" 
            as="li"
            :label="badge.label"
            class="w-min"
          />
        </ul>
      </div>
    </template> -->
    
    <template #roles-cell="{ row }">
      <ul>
        <li v-for="role in row.original.state.officer.roles" :key="role">{{ $t(`enum.officerRole.${role}`) }}</li>
      </ul>
    </template>
    
    <template #mailingAddress-cell="{ row }">
      <ConnectAddressDisplay :address="row.original.state.officer.mailingAddress" />
    </template>
    
    <template #deliveryAddress-cell="{ row }">
      <ConnectAddressDisplay 
        v-if="!isEqual(row.original.state.officer.mailingAddress, row.original.state.officer.deliveryAddress)" 
        :address="row.original.state.officer.deliveryAddress" 
      />
      <span v-else>{{ $t('label.sameAsMailAddress') }}</span>
    </template>

    <template #actions-cell="{ row }">
      <!-- <pre>{{ row }}</pre> -->
      <div class="flex justify-end">
        <UButtonGroup>
          <UButton
            variant="ghost"
            label="Cease"
            icon="i-mdi-close"
            class="px-4"
            @click="() => console.info('Cease: ', row.original)"
          />

          <UDropdownMenu
            :items="getRowActions(row)"
            :content="{ align: 'end' }"
          >
            <UButton
              variant="ghost"
              icon="i-mdi-caret-down"
              class="px-4"
              aria-label="More Actions"
            />
          </UDropdownMenu>
        </UButtonGroup>
      </div>
    </template>

    <template #expanded="{ row }">
      <FormOfficerChange 
        :default-obj="editState" 
        @cancel="cancelRowEdit"
        @submit.prevent="onRowEditSubmit($event, row)"
      />
    </template>
  </UTable>

  <pre>{{officers}}</pre>
</template>
