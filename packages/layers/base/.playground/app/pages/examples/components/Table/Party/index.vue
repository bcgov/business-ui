<script setup lang="ts">
import type { ExpandedState } from '@tanstack/vue-table'

definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ to: '/', label: 'Examples' }, { label: 'TableParty' }]
})

const expanded = ref<ExpandedState | undefined>(undefined)

function removeFn(row: TableBusinessRow<PartySchema>) {
  console.info('remove: ', row)
  // row.original.new.actions - typed
  // row.original.new.roles - typed
  // row.original.new.address - typed
  // row.original.new.name - typed
}
function undoFn(row: TableBusinessRow<PartySchema>) {
  console.info('undo: ', row)
}

function initEditFn(row: TableBusinessRow<PartySchema>) {
  console.info('init edit: ', row)
  expanded.value = { [row.index]: true }
}

const data: TableBusinessState<PartySchema>[] = [
  {
    new: {
      id: '',
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
    },
    old: {
      id: '',
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
  <div class="p-20">
    <TableParty
      v-model:expanded="expanded"
      :data
      @init-edit="initEditFn"
      @remove="removeFn"
      @undo="undoFn"
    >
      <template #expanded="{ row }">
        <div class="max-w-sm">
          {{ row }}
        </div>
      </template>
    </TableParty>
  </div>
</template>
