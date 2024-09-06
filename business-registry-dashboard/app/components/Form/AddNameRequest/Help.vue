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
    <BCRegContactInfo />
    <UButton
      class="self-start"
      :label="$t('btn.hideHelp')"
      variant="ghost"
      icon="i-mdi-help-circle-outline"
      @click="$emit('hideHelp')"
    />
  </div>
</template>
