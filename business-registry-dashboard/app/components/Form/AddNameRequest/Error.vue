<script setup lang="ts">
defineEmits<{
  retryNameRequest: [void]
}>()

const brdModal = useBrdModals()
</script>
<template>
  <div class="flex flex-col items-center gap-4 text-center">
    <UIcon name="i-mdi-alert-circle-outline" class="mt-10 size-8 text-red-500" />
    <h2 class="text-xl font-semibold">
      {{ $t('form.manageNR.error.general.heading') }}
    </h2>
    <p>{{ $t('form.manageNR.error.general.description') }}</p>
    <div class="flex gap-2">
      <UButton
        :label="$t('btn.cancel')"
        variant="outline"
        @click="brdModal.manageNameRequest(false)"
      />
      <UButton
        :label="$t('btn.tryAgain')"
        @click="$emit('retryNameRequest')"
      />
    </div>
  </div>
</template>
