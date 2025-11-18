<script setup lang="ts">
definePageMeta({
  layout: 'connect-auth'
})

type SomeState = {
  someState: {
    item1: string
    item2: string
    item3: string
  }
}

const { defaultColumns, expanded } = usePartyTable<SomeState>()

function removeFn(row: TablePartyRow<SomeState>) {
  console.info('remove: ', row)
  // row.original.new.actions - typed
  // row.original.new.someState - typed
}
function undoFn(row: TablePartyRow) {
  console.info('undo: ', row)
}

function initEditFn(row: TablePartyRow) {
  console.info('init edit: ', row)
  expanded.value = { [row.index]: true }
}

const data: TablePartyState<SomeState>[] = [
  {
    new: {
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
        lastName: 'Last'
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
          roleType: RoleType.LIQUIDATOR,
          appointmentDate: '2022-10-10',
          cessationDate: null,
          roleClass: 'AGENT'
        }
      ]
    },
    old: {
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
        lastName: 'Last'
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
          roleType: RoleType.LIQUIDATOR,
          appointmentDate: '2022-10-10',
          cessationDate: null,
          roleClass: 'AGENT'
        }
      ]
    }
    // old: {
    //   actions: [ActionType.ADDED],
    //   name: {
    //     partyType: PartyType.PERSON,
    //     firstName: 'First',
    //     middleName: 'Middle',
    //     lastName: 'Last'
    //   },
    //   address: {
    //     deliveryAddress: {
    //       street: '123 Main St',
    //       streetAdditional: '',
    //       city: 'Victoria',
    //       region: 'BC',
    //       postalCode: 'V1X 1X1',
    //       country: 'CA',
    //       locationDescription: 'Location Description'
    //     },
    //     mailingAddress: {
    //       street: 'test',
    //       streetAdditional: 'test',
    //       city: 'test',
    //       region: 'test',
    //       postalCode: 'test',
    //       country: 'test',
    //       locationDescription: 'test'
    //     },
    //     sameAs: true
    //   },
    //   roles: [
    //     {
    //       roleType: RoleType.LIQUIDATOR,
    //       appointmentDate: '2022-10-10',
    //       cessationDate: null,
    //       roleClass: 'AGENT'
    //     }
    //   ]
    // }
  }
]
</script>

<template>
  <div class="p-20">
    <TableParty
      :data
      :columns="defaultColumns"
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
