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
      Error Adding Name Request
    </h2>
    <p>We couldn't find a name request associated with the phone number or email address you entered. Please try again.</p>
    <div class="flex gap-2">
      <UButton
        label="Cancel"
        variant="outline"
        @click="brdModal.manageNameRequest(false)"
      />
      <UButton
        label="Try Again"
        @click="$emit('retryNameRequest')"
      />
    </div>
  </div>
</template>
