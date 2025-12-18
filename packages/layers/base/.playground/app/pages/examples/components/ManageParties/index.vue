<script setup lang="ts">
// import type { FormSubmitEvent } from '@nuxt/ui'
// import { onFormSubmitError } from '#imports'

definePageMeta({
  layout: 'connect-auth'
})

const { tableState } = useManageParties()

onMounted(() => {
  tableState.value = [
    {
      new: {
        id: '123',
        actions: [],
        address: {
          mailingAddress: {
            street: '123 Main St',
            streetAdditional: '',
            city: 'Vancouver',
            region: 'BC',
            postalCode: 'V1X 1X1',
            country: 'CA',
            locationDescription: ''
          },
          deliveryAddress: {
            street: '123 Main St',
            streetAdditional: '',
            city: 'Vancouver',
            region: 'BC',
            postalCode: 'V1X 1X1',
            country: 'CA',
            locationDescription: ''
          },
          sameAs: true
        },
        name: {
          firstName: 'Henry',
          middleName: '',
          lastName: 'Toth',
          businessName: '',
          partyType: PartyType.PERSON
        },
        roles: []
      },
      old: {
        id: '123',
        actions: [],
        address: {
          mailingAddress: {
            street: '123 Main St',
            streetAdditional: '',
            city: 'Vancouver',
            region: 'BC',
            postalCode: 'V1X 1X1',
            country: 'CA',
            locationDescription: ''
          },
          deliveryAddress: {
            street: '123 Main St',
            streetAdditional: '',
            city: 'Vancouver',
            region: 'BC',
            postalCode: 'V1X 1X1',
            country: 'CA',
            locationDescription: ''
          },
          sameAs: true
        },
        name: {
          firstName: 'Henry',
          middleName: '',
          lastName: 'Toth',
          businessName: '',
          partyType: PartyType.PERSON
        },
        roles: []
      }
    }
  ]
})

const schema = getActivePartySchema()
const activeParty = ref<ActivePartySchema | undefined>(undefined)
const loading = ref(false)

watch(activeParty, v => console.log('Active Party: ', v))
</script>

<template>
  <div class="py-10 flex flex-col gap-10 items-center">
    <ConnectPageSection
      :heading="{ label: 'Manage Parties' }"
      ui-body="p-10"
    >
      <!-- :ui-body="hasErrors ? 'p-10 border-l-2 border-error' : 'p-10'" -->

      <ManageParties
        v-model:active-party="activeParty"
        :loading="loading"
        :empty-text="loading ? `Loading...` : 'No parties'"
        add-label="Add Party"
        edit-label="Edit Party"
      />
    </ConnectPageSection>
  </div>
</template>
