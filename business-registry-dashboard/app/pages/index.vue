<script setup lang="ts">
definePageMeta({
  order: 0
})
</script>
<template>
  <NuxtLayout name="dashboard">
    <div>
      <BusinessLookup class="-mt-4" />
      <TableAffiliatedEntity />
    </div>
  </NuxtLayout>
</template>
