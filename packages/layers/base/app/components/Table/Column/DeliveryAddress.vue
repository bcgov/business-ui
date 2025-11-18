<script setup lang="ts">
defineProps<{
  data: AddressSchema
  isRemoved: boolean
}>()
</script>

<template>
  <div
    :class="[
      { 'opacity-50': isRemoved },
      'px-2 py-4 min-w-48 max-w-48 overflow-clip text-sm'
    ]"
  >
    <ConnectAddressDisplay
      :address="data.deliveryAddress"
      :text-decor="true"
    />
  </div>
</template>
