<script setup lang="ts">
defineProps<{
  data: AddressSchema
}>()
</script>

<template>
  <ConnectAddressDisplay
    :address="data.deliveryAddress"
    :text-decor="true"
  />
</template>
