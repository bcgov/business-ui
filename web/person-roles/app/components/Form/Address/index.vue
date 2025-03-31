<script setup lang="ts">
import type * as z from 'zod'
import type { Form } from '@nuxt/ui'

type AddressField = 'country' | 'street' | 'streetName' | 'streetNumber' |
  'unitNumber' | 'streetAdditional' | 'city' | 'region' | 'postalCode' |
  'locationDescription'

const props = defineProps<{
  id: string
  // schema: z.ZodSchema<Partial<ConnectAddress>>
  schemaPrefix: string
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  formRef?: Form<any> | null
  disabledFields?: AddressField[]
  excludedFields?: AddressField[]
  // TODO: cleanup below strategies
  hideStreetHint?: boolean
  locationDescLabel?: boolean
  unitNumbRequired?: boolean
}>()

const state = defineModel<Partial<ConnectAddress>>({ required: true })

async function populateAddressComplete(e: ConnectAddress) {
  const keys = Object.keys(e) as AddressField[]
  for (const key of keys) {
    if (
      !props.disabledFields?.includes(key)
      && !props.excludedFields?.includes(key)
    ) {
      state.value[key] = e[key]
    }
  }

  await nextTick()

  // TODO: confirm type of keys
  if (props.formRef) {
    const fields = keys.map(k => props.schemaPrefix + k)
    // @ts-expect-error - keys type mismatch
    props.formRef.validate({ name: fields, silent: true })
  }
}
</script>

<template>
  <div class="space-y-4">
    <FormAddressCountry
      :id
      v-model="state.country"
      :schema-prefix="schemaPrefix"
      @change="state.region = ''"
    />

    <FormAddressStreet
      :id
      v-model="state.street"
      :schema-prefix="schemaPrefix"
      :country="state.country"
      :disable-address-complete="false"
      @address-complete="populateAddressComplete"
    />

    <FormAddressStreetAdditional
      :id
      v-model="state.streetAdditional"
      :schema-prefix="schemaPrefix"
    />

    <div class="flex flex-col gap-4 sm:flex-row">
      <FormAddressCity
        :id
        v-model="state.city"
        :schema-prefix="schemaPrefix"
      />

      <FormAddressRegion
        :id
        v-model="state.region"
        :schema-prefix="schemaPrefix"
        :country="state.country"
      />

      <FormAddressPostalCode
        :id
        v-model="state.postalCode"
        :schema-prefix="schemaPrefix"
        :country="state.country"
      />
    </div>

    <FormAddressDeliveryInstructions
      :id
      v-model="state.locationDescription"
      :schema-prefix="schemaPrefix"
    />
  </div>
</template>
