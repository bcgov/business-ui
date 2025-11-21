<script setup lang="ts">
import type { ExpandedState } from '@tanstack/vue-table'

definePageMeta({
  layout: 'connect-pay-tombstone-buttons',
  middleware: [
    // Check for login redirect
    'connect-auth'
  ]
})

const staffPayStore = useStaffPaymentStore()
const { setButtonControl } = useConnectButtonControl()

setButtonControl({
  leftGroup: { buttons: [] },
  rightGroup: { buttons:
      [
        {
          label: 'Submit',
          type: 'submit',
          // @ts-expect-error - form attr will be typed once this change has been published
          // https://github.com/nuxt/ui/pull/5348
          form: 'receiver-filing'
        }
      ]
  }
})

// type Schema = z.output<typeof schema>
type FullSchema = { courtOrder: CourtOrderPoaSchema, activeParty: PartyStateBase } // & Schema

const state = reactive<FullSchema>({
  courtOrder: {
    courtOrderNumber: '',
    hasPoa: false
  },
  activeParty: {
    name: {
      partyType: PartyType.PERSON,
      businessName: '',
      firstName: '',
      middleName: '',
      lastName: ''
    },
    address: {
      deliveryAddress: {
        street: '',
        streetAdditional: '',
        city: '',
        region: '',
        postalCode: '',
        country: 'CA',
        locationDescription: ''
      },
      mailingAddress: {
        street: '',
        streetAdditional: '',
        city: '',
        region: '',
        postalCode: '',
        country: 'CA',
        locationDescription: ''
      },
      sameAs: false
    },
    roles: [],
    actions: [ActionType.ADDED]
  }
})
const expanded = ref<ExpandedState | undefined>(undefined)
</script>

<template>
  <!-- flex flex-col lg:flex-row lg:gap-6 grow app-inner-container -->
  <UForm
    id="receiver-filing"
    :state
    class="py-10 flex flex-col gap-10"
    novalidate
    @submit="(e) => console.info('trying to submit: ', e.data)"
    @error="(e) => console.info('validation errors: ', e.errors)"
  >
    <div class="flex flex-col gap-1">
      <h1>Manage Receivers</h1>
      <p>Some receiver descriptive text</p>
    </div>
    <section class="flex flex-col gap-4">
      <h2 class="text-base">
        1. Receiver Information
      </h2>
      <UButton
        label="Add Receiver"
        variant="outline"
        icon="i-mdi-account-plus-outline"
        class="w-min"
        @click="() => console.info('open receiver sub form')"
      />
      <FormReceiverDetails
        v-model="state.activeParty"
        name="newParty"
        @done="() => console.info('done')"
        @cancel="() => console.info('cancel')"
      />
      <TableParty v-model:expanded="expanded" :data="[]">
        <template #expanded="{ row }">
          <div class="max-w-lg">
            {{ row }}
          </div>
        </template>
      </TableParty>
    </section>

    <FormCourtOrderPoa
      ref="court-order-poa-ref"
      v-model="state.courtOrder"
      name="courtOrder"
      order="2"
      :state="state.courtOrder"
    />

    <div class="border-2 border-black w-full p-10 font-bold">
      DOCUMENT SCANNING
    </div>

    <ConnectFieldset label="4. Staff Payment" body-variant="card">
      <ConnectFormFieldWrapper label="Payment" orientation="horizontal">
        <StaffPayment
          v-model="staffPayStore.staffPayment"
          :state="staffPayStore.staffPayment"
          :show-priority="true"
        />
      </ConnectFormFieldWrapper>
    </ConnectFieldset>
  </UForm>
</template>
