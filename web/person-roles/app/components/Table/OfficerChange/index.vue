<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { ExpandedState, Row } from '@tanstack/vue-table'
import { isEqual } from 'lodash'
import { getRequiredAddress } from '~/utils/validate/address/mailing'

const { t } = useI18n()
const officerStore = useOfficerStore()

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
// const AddressDisplay = resolveComponent('AddressDisplay')

const columns: TableColumn<OfficerTableState>[] = [
  {
    accessorKey: 'officer.firstName',
    header: 'Name',
    meta: {
      class: {
        td: 'pl-6 font-bold',
        th: 'pl-6'
      }
    },
    cell: ({ row }) => {
      const name = row.original.officer.firstName as string
      return name.toUpperCase()
    }
  },
  {
    id: 'roles',
    accessorKey: 'officer.roles',
    header: 'Roles'
  },
  {
    accessorKey: 'mailingAddress',
    id: 'mailingAddress',
    header: 'Mailing Address'
  },
  {
    accessorKey: 'deliveryAddress',
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

// const mailingAddressState = ref({
//   street: '260 Champ Ave',
//   streetAdditional: '',
//   city: 'Vancouver',
//   region: 'BC',
//   postalCode: 'G1J 4M6',
//   country: 'CA',
//   locationDescription: ''
// })

// const schema = getRequiredAddress(
//   t('validation.address.street'),
//   t('validation.address.city'),
//   t('validation.address.region'),
//   t('validation.address.postalCode'),
//   t('validation.address.country')
// )

const expanded = ref<ExpandedState | undefined>(undefined)

function handleEdit(index: number) {
  expanded.value = { [index]: true }
}

function getRowActions(row: Row<OfficerTableState>) {
  return [
    {
      label: 'Change Legal Name',
      onSelect() {
        console.log('change legal name: ', row.original.officer.firstName)
      }
    },
    {
      label: 'Change Roles',
      onSelect() {
        console.log('change roles: ', row.original.officer.roles)
      }
    },
    {
      label: 'Change Address',
      onSelect() {
        console.log('change address: ', row.original.officer.mailingAddress)
      }
    }
  ]
}
</script>

<template>
  <!-- eslint-disable -->
  <UTable
    v-model:expanded="expanded"
    :data="officerStore.displayedOfficerState"
    :columns="columns"
    class="flex-1"
    sticky
    :ui="{
      root: 'bg-white rounded-sm ring ring-gray-200',
      tbody: 'px-10',
      th: 'bg-bcGovColor-gray2 px-2',
      td: 'px-2 text-bcGovGray-700 align-top'
    }"
  >
    <template #mailingAddress-cell="{ row }">
      <ConnectAddressDisplay :address="row.original.officer.mailingAddress" />
      <!-- <pre>{{row.original}}</pre> -->
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

    <!-- <template #roles-cell>
      test
    </template> -->

    <template #expanded="{ row }">
      <div class="flex flex-col sm:flex-row gap-2 px-4">
        <div
          id="officer-form-title"
          class="w-1/4 font-bold text-black text-base"
        >
          Edit Item
        </div>
        <!-- <FormAddressMailing
          id="mailing-address"
          v-model="mailingAddressState"
          class="w-full grow"
          :schema="schema"
          schema-prefix=""
        /> -->
        <!-- <pre>{{ row }}</pre> -->
      </div>
      <div class="flex gap-4 w-full ml-auto justify-end pr-4 py-8">
        <UButton
          label="Done"
        />
        <UButton
          label="Cancel"
          variant="outline"
        />
      </div>
      <pre>{{ row }}</pre>
    </template>
  </UTable>
</template>
