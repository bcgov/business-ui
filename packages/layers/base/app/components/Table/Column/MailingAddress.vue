<script setup lang="ts">
const props = defineProps<{
  data: AddressSchema
}>()

const addressSchema = getRequiredAddressSchema()
const isValidAddress = computed(() => (addressSchema.safeParse(props.data.mailingAddress)).success)
</script>

<template>
  <div>
    <span v-if="data.sameAs">{{ $t('label.sameAsDeliveryAddress') }}</span>
    <span v-else-if="!isValidAddress">{{ $t('label.notEntered') }}</span>
    <ConnectAddressDisplay
      v-else
      :address="data.mailingAddress"
      :text-decor="true"
    />
  </div>
</template>
