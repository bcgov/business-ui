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
  <div class="flex flex-col text-left">
    <h2 class="mb-4 text-xl font-semibold">
      {{ $t(`modal.removeBusiness.generic.${removeBusinessPayload.business.corpType.code}.title`) }}
    </h2>
    <p class="mb-4">
      {{ $t(selectDescription(removeBusinessPayload), { FILING_TYPE: affiliationType(removeBusinessPayload.business) || '' }) }}
    </p>
    <div class="mt-2 flex flex-wrap items-center justify-center gap-4">
      <UButton
        :class="['px-10 py-2']"
        :block="isSmallScreen"
        :label="$t(`modal.removeBusiness.generic.${removeBusinessPayload.business.corpType.code}.secondaryBtnLabel`)"
        variant="outline"
        @click="$emit('close')"
      />
      <UButton
        :class="['px-10 py-2']"
        :block="isSmallScreen"
        :label="$t(`modal.removeBusiness.generic.${removeBusinessPayload.business.corpType.code}.primaryBtnLabel`)"
        :loading
        @click="$emit('confirm')"
      />
    </div>
  </div>
</template>
