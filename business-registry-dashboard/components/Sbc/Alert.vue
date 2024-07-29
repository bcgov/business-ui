<script setup lang="ts">
const alertStore = useAlertStore()
const busStore = useBusinessStore()
const props = defineProps<{
    showOnCategory: string | string[]
  }>()

const showAlert = computed(() => {
  const categories = Array.isArray(props.showOnCategory) ? props.showOnCategory : [props.showOnCategory]

  // return the internal server alert if there is one present
  const internalServerErrorAlert = alertStore.alerts.find(alert => alert.category === AlertCategory.INTERNAL_SERVER_ERROR)
  if (internalServerErrorAlert) {
    return [internalServerErrorAlert]
  }

  return alertStore.alerts.filter(alert => categories.includes(alert.category))
})
</script>
<template>
  <UAlert
    v-if="showAlert.length > 0"
    :title="$t(`alerts.${showAlert[0].category}.title`)"
    :description="$t(`alerts.${showAlert[0].category}.description`, { date: busStore.nextArDate })"
    class="text-left"
    icon="i-mdi-alert"
    :variant="showAlert[0].severity"
    :ui="{
      title: 'text-base text-bcGovColor-midGray font-semibold',
      description: 'mt-1 text-base leading-4 text-bcGovColor-midGray'
    }"
    data-testid="sbc-alert"
  />
</template>
