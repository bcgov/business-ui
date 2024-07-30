<script setup lang="ts">
defineProps<{
  address: BusinessAddress
}>()
</script>
<template>
  <div class="flex flex-col text-bcGovColor-midGray">
    <span>{{ address.streetAddress }}</span>
    <span>{{ address.streetAddressAdditional }}</span>
    <div class="space-x-1 whitespace-nowrap">
      <span>{{ address.addressCity }}</span>
      <span>{{ address.addressRegion }}</span>
      <span>{{ address.postalCode }}</span>
    </div>
    <span>{{ address.addressCountry }}</span>
  </div>
</template>
