<script setup lang="ts">
defineEmits<{
  hideHelp: [void]
}>()
</script>
<template>
  <div class="flex flex-col gap-4">
    <h2 class="mt-4 text-lg font-semibold">
      Need Help?
    </h2>
    <p>If you have lost your receipt and name results email and need assistance finding your Name Request (NR) Number, please contact use at:</p>
    <ul>
      <li>Toll Free: <a class="text-blue-500 underline" href="tel:+1-877-370-1033">1-877-370-1033</a></li>
      <li>Victoria Office: <a class="text-blue-500 underline" href="tel:+1-250-370-1033">1-250-370-1033</a></li>
      <li>Email: <a class="text-blue-500 underline" href="mailto:BCRegistries@gov.bc.ca?subject=BC Registries and Online Services - Support Request">BCRegistries@gov.bc.ca</a></li>
    </ul>
    <div class="flex flex-col">
      <span class="font-semibold"> Hours of Operation:</span>
      <span>Monday to Friday, 8:30am - 4:30pm Pacific Time</span>
    </div>
    <UButton
      class="self-start"
      label="Hide Help"
      variant="ghost"
      icon="i-mdi-help-circle-outline"
      @click="$emit('hideHelp')"
    />
  </div>
</template>
