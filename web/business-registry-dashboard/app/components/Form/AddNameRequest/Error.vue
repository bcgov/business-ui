<script setup lang="ts">
import { FetchError } from 'ofetch'
import { StatusCodes } from 'http-status-codes'

const { t } = useNuxtApp().$i18n
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
      description = t('form.manageNR.error.400.description')
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
  <div class="flex flex-col gap-4 pt-8 text-left">
    <div class="flex">
      <UIcon name="i-mdi-alert" class="mr-2 size-6 text-red-500" />
      <h2 class="text-base font-semibold text-bcGovColor-midGray">
        {{ errorText.title }}
      </h2>
    </div>
    <p>{{ errorText.description }}</p>
    <BCRegContactInfo class="self-start text-left" />
    <div class="flex justify-center gap-2 pt-8">
      <UButton
        :label="$t('btn.cancel')"
        variant="outline"
        class="px-7"
        :ui="{ base: 'h-11 rounded' }"
        @click="brdModal.close()"
      />
      <UButton
        :label="$t('btn.tryAgain')"
        class="px-7"
        :ui="{ base: 'h-11 rounded' }"
        @click="$emit('retryNameRequest')"
      />
    </div>
    <div class="sr-only" role="status">
      {{ ariaAlertText }}
    </div>
  </div>
</template>
