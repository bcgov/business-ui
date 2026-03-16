<script setup lang="ts">
const props = defineProps<{
  data: AddressSchema
}>()

const addressSchema = getRequiredAddressSchema()
const isValidAddress = computed(() => (addressSchema.safeParse(props.data.deliveryAddress)).success)
</script>

<template>
  <div>
    <span v-if="data.sameAs">{{ $t('label.sameAsMailingAddress') }}</span>
    <span v-else-if="!isValidAddress">{{ $t('label.notEntered') }}</span>
    <ConnectAddressDisplay
      v-else
      :address="data.deliveryAddress"
      :text-decor="true"
    />
  </div>
</template>
