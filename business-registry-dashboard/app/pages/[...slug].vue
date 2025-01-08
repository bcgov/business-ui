<script setup lang="ts">
// This is a catch-all route that will handle any undefined routes
// This will handle the intermittent page 404 not found until the middleware is loaded
</script>

<template>
  <NuxtLayout name="dashboard">
    <DashboardContent />
  </NuxtLayout>
</template>
