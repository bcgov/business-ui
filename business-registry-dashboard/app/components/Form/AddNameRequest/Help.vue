<script setup lang="ts">
defineEmits<{
  hideHelp: [void]
}>()
</script>
<template>
  <div class="flex flex-col gap-4">
    <h2 class="mt-4 text-lg font-semibold">
      {{ $t('form.manageNR.help.heading') }}
    </h2>
    <p>{{ $t('form.manageNR.help.description') }}</p>
    <ul>
      <li>{{ $t('contactInfo.bcRegGeneral.tollFree.title') }} <a class="text-blue-500 underline" href="tel:+1-877-370-1033">1-877-370-1033</a></li>
      <li>{{ $t('contactInfo.bcRegGeneral.victoriaOffice.title') }} <a class="text-blue-500 underline" href="tel:+1-250-370-1033">1-250-370-1033</a></li>
      <li>{{ $t('contactInfo.bcRegGeneral.email.title') }} <a class="text-blue-500 underline" href="mailto:BCRegistries@gov.bc.ca?subject=BC Registries and Online Services - Support Request">BCRegistries@gov.bc.ca</a></li>
    </ul>
    <div class="flex flex-col">
      <span class="font-semibold">{{ $t('contactInfo.bcRegGeneral.hours.title') }}</span>
      <span>{{ $t('contactInfo.bcRegGeneral.hours.value') }}</span>
    </div>
    <UButton
      class="self-start"
      :label="$t('btn.hideHelp')"
      variant="ghost"
      icon="i-mdi-help-circle-outline"
      @click="$emit('hideHelp')"
    />
  </div>
</template>
