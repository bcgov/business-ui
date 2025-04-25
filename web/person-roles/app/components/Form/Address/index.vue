<script setup lang="ts">
// type AddressField = 'country' | 'street' | 'streetName' | 'streetNumber' |
//   'unitNumber' | 'streetAdditional' | 'city' | 'region' | 'postalCode' |
//   'locationDescription'

const props = defineProps<{
  id: string
  schemaPrefix: string
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  formRef?: any
  disabledFields?: Array<keyof UiAddress>
  excludedFields?: Array<keyof UiAddress>
  // TODO: cleanup below strategies
  hideStreetHint?: boolean
  locationDescLabel?: boolean
  unitNumbRequired?: boolean
  notPoBox?: boolean
}>()

const state = defineModel<Partial<UiAddress>>({ required: true })

async function populateAddressComplete(e: UiAddress) {
  const keys = Object.keys(e) as Array<keyof UiAddress>
  for (const key of keys) {
    if (
      !props.disabledFields?.includes(key)
      && !props.excludedFields?.includes(key)
    ) {
      state.value[key] = e[key]
    }
  }

  await nextTick()

  if (props.formRef) {
    const fields = keys.map(k => props.schemaPrefix + k)
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
      :not-po-box="notPoBox"
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
