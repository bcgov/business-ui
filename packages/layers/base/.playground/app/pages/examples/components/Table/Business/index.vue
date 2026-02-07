<script setup lang="ts">
import type { ExpandedState } from '@tanstack/vue-table'

definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ to: '/', label: 'Examples' }, { label: 'TableOffices' }]
})

type SomeState = {
  someState: {
    item1: string
    item2: string
    item3: string
  }
}

type TableDataState = SomeState & PartySchema

const partyColumns = getPartyTableColumns<TableDataState>()
const expanded = ref<ExpandedState | undefined>(undefined)

function removeFn(row: TableBusinessRow<TableDataState>) {
  console.info('remove: ', row)
  // row.original.new.actions - typed
  // row.original.new.someState - typed
}
function undoFn(row: TableBusinessRow<TableDataState>) {
  console.info('undo: ', row)
}

function initEditFn(row: TableBusinessRow<TableDataState>) {
  console.info('init edit: ', row)
  expanded.value = { [row.index]: true }
}

const data: TableBusinessState<TableDataState>[] = [
  {
    new: {
      id: '',
      someState: {
        item1: '',
        item2: '',
        item3: ''
      },
      actions: [ActionType.ADDRESS_CHANGED, ActionType.NAME_CHANGED],
      name: {
        partyType: PartyType.PERSON,
        firstName: 'First New',
        middleName: 'Middle',
        lastName: 'Last',
        businessName: ''
      },
      address: {
        deliveryAddress: {
          street: '12345 Main St',
          streetAdditional: 'Additional Street Info',
          city: 'Victoria',
          region: 'BC',
          postalCode: 'V1X 1X1',
          country: 'CA',
          locationDescription: 'Location Description'
        },
        mailingAddress: {
          street: '12345 Main St',
          streetAdditional: 'Additional Street Info',
          city: 'Victoria',
          region: 'BC',
          postalCode: 'V1X 1X1',
          country: 'CA',
          locationDescription: 'Location Description'
        },
        sameAs: true
      },
      roles: [
        {
          roleType: RoleTypeUi.LIQUIDATOR,
          appointmentDate: '2022-10-10',
          cessationDate: null,
          roleClass: RoleClass.AGENT
        }
      ]
    },
    old: {
      id: '',
      someState: {
        item1: '',
        item2: '',
        item3: ''
      },
      actions: [ActionType.ADDED],
      name: {
        partyType: PartyType.PERSON,
        firstName: 'First',
        middleName: 'Middle',
        lastName: 'Last',
        businessName: ''
      },
      address: {
        deliveryAddress: {
          street: '123 Main St',
          streetAdditional: '',
          city: 'Victoria',
          region: 'BC',
          postalCode: 'V1X 1X1',
          country: 'CA',
          locationDescription: 'Location Description'
        },
        mailingAddress: {
          street: 'test',
          streetAdditional: 'test',
          city: 'test',
          region: 'test',
          postalCode: 'test',
          country: 'test',
          locationDescription: 'test'
        },
        sameAs: true
      },
      roles: [
        {
          roleType: RoleTypeUi.LIQUIDATOR,
          appointmentDate: '2022-10-10',
          cessationDate: null,
          roleClass: RoleClass.AGENT
        }
      ]
    }
  }
]
</script>

<template>
  <div class="p-20 space-y-20">
    <TableBusiness
      v-model:expanded="expanded"
      :data
      :columns="partyColumns"
      @init-edit="initEditFn"
      @remove="removeFn"
      @undo="undoFn"
    >
      <template #expanded="{ row }">
        <div class="max-w-sm">
          {{ row }}
        </div>
      </template>
    </TableBusiness>
  </div>
</template>
