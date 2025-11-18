<script setup lang="ts">
const props = defineProps<{
  data: AddressSchema
  isRemoved: boolean
}>()

const addressSchema = getRequiredAddressSchema()
const isValidAddress = computed(() => (addressSchema.safeParse(props.data.mailingAddress)).success)
</script>

<template>
  <div
    :class="[
      { 'opacity-50': isRemoved },
      'px-2 py-4 min-w-48 max-w-48 overflow-clip text-sm'
    ]"
  >
    <span v-if="data.sameAs">{{ $t('label.sameAsDeliveryAddress') }}</span>
    <span v-else-if="!isValidAddress">{{ $t('label.notEntered') }}</span>
    <ConnectAddressDisplay
      v-else
      :address="data.mailingAddress"
      :text-decor="true"
    />
  </div>
</template>
