<script setup lang="ts">
import { FetchError } from 'ofetch'
import { StatusCodes } from 'http-status-codes'

const { t } = useI18n()
const brdModal = useBrdModals()

const props = defineProps<{
  error: FetchError
}>()

defineEmits<{
  retryNameRequest: [void]
}>()

const ariaAlertText = ref('')
const errorText = computed(() => {
  let title = ''
  let description = ''

  switch (props.error.status) {
    case StatusCodes.BAD_REQUEST:
      title = t('form.manageNR.error.400.title')
      description = props.error.data.message || t('form.manageNR.error.400.description')
      break
    case StatusCodes.NOT_FOUND:
      title = t('form.manageNR.error.404.title')
      description = t('form.manageNR.error.404.description')
      break
    case StatusCodes.INTERNAL_SERVER_ERROR:
      title = t('form.manageNR.error.500.title')
      description = t('form.manageNR.error.500.description')
      break
    default:
      title = t('form.manageNR.error.default.title')
      description = t('form.manageNR.error.default.description')
      break
  }

  return { title, description }
})

const setScreenReaderAlert = (message: string) => {
  ariaAlertText.value = ''
  ariaAlertText.value = message
}

onMounted(() => {
  setTimeout(() => {
    setScreenReaderAlert(errorText.value.title + ' ' + errorText.value.description)
  }, 1000)
})
</script>
<template>
  <div class="flex flex-col items-center gap-4 text-center">
    <UIcon name="i-mdi-alert-circle-outline" class="mt-10 size-8 text-red-500" />
    <h2 class="text-xl font-semibold">
      {{ errorText.title }}
    </h2>
    <p>{{ errorText.description }}</p>
    <div class="mt-8 flex gap-2">
      <UButton
        :label="$t('btn.cancel')"
        variant="outline"
        @click="brdModal.close()"
      />
      <UButton
        :label="$t('btn.tryAgain')"
        @click="$emit('retryNameRequest')"
      />
    </div>
    <div class="sr-only" role="status">
      {{ ariaAlertText }}
    </div>
  </div>
</template>
