<script setup lang="ts">
const isSmallScreen = useMediaQuery('(max-width: 640px)')
defineProps<{
  removeBusinessPayload: RemoveBusinessPayload
  loading: boolean
}>()

defineEmits<{
  confirm: [void]
  close: [void]
}>()
</script>
<template>
  <div class="flex flex-col items-center gap-4 text-center">
    <UIcon name="i-mdi-alert-circle-outline" class="-mt-10 size-8 text-red-500" />
    <h2 class="text-xl font-semibold">
      {{ $t(`modal.removeBusiness.generic.${removeBusinessPayload.business.corpType.code}.title`) }}
    </h2>
    <p>{{ $t(`modal.removeBusiness.generic.${removeBusinessPayload.business.corpType.code}.description`) }}</p>
    <div class="mt-2 flex flex-wrap items-center justify-center gap-4">
      <UButton
        :block="isSmallScreen"
        :label="$t(`modal.removeBusiness.generic.${removeBusinessPayload.business.corpType.code}.primaryBtnLabel`)"
        :loading
        @click="$emit('confirm')"
      />
      <UButton
        :block="isSmallScreen"
        :label="$t(`modal.removeBusiness.generic.${removeBusinessPayload.business.corpType.code}.secondaryBtnLabel`)"
        color="gray"
        @click="$emit('close')"
      />
    </div>
  </div>
</template>
