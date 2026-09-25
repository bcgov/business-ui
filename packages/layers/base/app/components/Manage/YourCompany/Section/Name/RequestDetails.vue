<script setup lang="ts">
const props = defineProps<{
  nrData?: NameRequest
  fieldState?: ManageYourCompanyFields['nameRequest']
}>()

const { t } = useI18n()

const details = computed(() => {
  const data = props.nrData
  if (!data) {
    return undefined
  }
  return [
    { label: t('label.businessType'), value: getCorpFullDescription(data.legalType) },
    { label: t('label.requestType'), value: t(`nameRequestAction.${data.request_action_cd}`) },
    { label: t('label.expiryDate'), value: toReadableDate(data.expirationDate) },
    { label: t('label.status'), value: t(`nameRequestState.${data.state}`) }
  ]
})
</script>

<template>
  <div v-if="details" class="flex flex-col gap-4">
    <div class="flex flex-col text-neutral-highlighted">
      <span class="text-xl font-bold">{{ fieldState?.value?.legalName || '' }}</span>
      <span class="text-lg">{{ fieldState?.value?.nrNumber || '' }}</span>
    </div>
    <dl>
      <div
        v-for="item in details"
        :key="item.label"
        class="flex flex-row flex-wrap gap-2"
      >
        <dt class="font-bold text-neutral-highlighted">
          {{ item.label }}:
        </dt>
        <dd>{{ item.value }}</dd>
      </div>
    </dl>
  </div>
</template>
