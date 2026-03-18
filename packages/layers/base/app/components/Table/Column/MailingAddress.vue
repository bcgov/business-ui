<script setup lang="ts">
defineProps<{
  data: AddressSchema
}>()
</script>

<template>
  <ConnectAddressDisplay
    :address="data.mailingAddress"
    :text-decor="true"
  />
</template>
