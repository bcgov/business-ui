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
function selectDescription (removeBusinessPayload: RemoveBusinessPayload) {
  // Different discriptions for Continuation In's if they have a name request
  if (removeBusinessPayload.business.corpType.code === CorpTypes.CONTINUATION_IN && removeBusinessPayload.business.nameRequest) {
    return `modal.removeBusiness.generic.${removeBusinessPayload.business.corpType.code}.descriptionNamed`
  }
  return `modal.removeBusiness.generic.${removeBusinessPayload.business.corpType.code}.description`
}
</script>
<template>
  <div class="flex flex-col items-center gap-4 text-center">
    <div class="relative -mt-10 flex w-full items-center justify-center">
      <UIcon name="i-mdi-alert-circle-outline" class="size-8 text-red-500" />
      <UButton
        ref="closeButtonRef"
        :ui="{ icon: { base: 'shrink-0 scale-150' } }"
        icon="i-mdi-close"
        color="primary"
        :aria-label="$t('btn.close')"
        square
        variant="ghost"
        class="absolute right-0"
        @click="$emit('close')"
      />
    </div>
    <h2 class="text-xl font-semibold">
      {{ $t(`modal.removeBusiness.generic.${removeBusinessPayload.business.corpType.code}.title`) }}
    </h2>
    <p>{{ $t(selectDescription(removeBusinessPayload)) }}</p>
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
