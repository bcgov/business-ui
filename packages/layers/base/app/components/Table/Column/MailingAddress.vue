<script setup lang="ts">
const props = defineProps<{
  data: AddressSchema
  /** marks an incomplete address with this text instead of showing it as is */
  invalidLabel?: string
}>()

const addressSchema = getRequiredAddressSchema()
const isValidAddress = computed(() => addressSchema.safeParse(props.data.mailingAddress).success)
const showInvalidLabel = computed(() => !!props.invalidLabel && !isValidAddress.value)
</script>

<template>
  <div v-if="showInvalidLabel">
    <ConnectAddressDisplay
      v-if="hasAddressInput(data.mailingAddress)"
      :address="data.mailingAddress"
      :text-decor="true"
    />
    <span class="italic text-error" data-testid="invalid-address-label">{{ invalidLabel }}</span>
  </div>
  <ConnectAddressDisplay
    v-else
    :address="data.mailingAddress"
    :text-decor="true"
  />
</template>
