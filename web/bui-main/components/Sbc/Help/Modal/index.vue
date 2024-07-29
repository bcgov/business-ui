<script setup lang="ts">
const { isOpen, close } = useHelpModal()
</script>
<template>
  <UModal v-model="isOpen" fullscreen>
    <UCard :ui="{ rounded: 'rounded-none', body: { background: 'bg-bcGovColor-gray1', base: 'min-h-screen' } }" class="relative">
      <UButton
        :label="$t('btn.close')"
        icon="i-mdi-close"
        trailing
        size="sm"
        class="fixed right-4 top-4"
        @click="close()"
      />
      <SbcHelpContent />
    </UCard>
  </UModal>
</template>
