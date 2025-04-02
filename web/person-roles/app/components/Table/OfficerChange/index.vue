<script setup lang="ts">
import type { FormSubmitEvent, TableColumn } from '@nuxt/ui'
import type { ExpandedState, Row } from '@tanstack/vue-table'
import { isEqual, merge } from 'lodash'

const { officers } = storeToRefs(useOfficerStore())

const columns: TableColumn<OfficerTableState>[] = [
  {
    header: 'Name',
    meta: {
      class: {
        td: 'pl-6 font-bold min-w-48 max-w-48 whitespace-normal',
        th: 'pl-6'
      }
    },
    cell: ({ row }) => {
      const officer = row.original.officer
      const name = `${officer.firstName} ${officer.middleName} ${officer.lastName}`
      return name.toUpperCase()
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
  const officer = JSON.parse(JSON.stringify(row.original.officer))

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
  const initialOfficer = row.original.officer
  const initialHistory = row.original.history

  let newOfficer: OfficerTableState = {} as OfficerTableState

  if (action === 'edit') {
    newOfficer = {
      officer: merge({}, initialOfficer, data),
      history: [...initialHistory, initialOfficer]
    }
  } else {
    const previousOfficer = initialHistory[initialHistory.length - 1]
    if (previousOfficer) {
      const newHistory = initialHistory.slice(0, initialHistory.length - 1)
      newOfficer = {
        officer: { ...previousOfficer },
        history: newHistory
      }
    }
  }

  officers.value = [
    ...officers.value.slice(0, index),
    newOfficer,
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
    <template #roles-cell="{ row }">
      <ul>
        <li v-for="role in row.original.officer.roles" :key="role">{{ $t(`enum.officerRole.${role}`) }}</li>
      </ul>
    </template>
    
    <template #mailingAddress-cell="{ row }">
      <ConnectAddressDisplay :address="row.original.officer.mailingAddress" />
    </template>
    
    <template #deliveryAddress-cell="{ row }">
      <ConnectAddressDisplay 
        v-if="!isEqual(row.original.officer.mailingAddress, row.original.officer.deliveryAddress)" 
        :address="row.original.officer.deliveryAddress" 
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
