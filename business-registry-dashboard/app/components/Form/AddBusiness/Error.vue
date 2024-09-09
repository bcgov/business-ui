<script setup lang="ts">
import { FetchError } from 'ofetch'
import { StatusCodes } from 'http-status-codes'

// const { t } = useI18n() // TODO: add translations
const brdModal = useBrdModals()

const props = defineProps<{
  errorObj: {error: FetchError, type: string}
}>()

defineEmits<{
  retry: [void]
}>()

const apiErrorMsg = computed<string | null>(() => props.errorObj.error?.data?.message ?? null)

const ariaAlertText = ref('')
const errorText = computed(() => {
  const error = props.errorObj.error
  let title = ''
  let description = ''

  if (props.errorObj.type === 'email') {
    title = 'Error Sending Authorization Email'
    description = 'An error occurred sending authorization email. Please try again.'
  }

  if (props.errorObj.type === 'delegation') {
    title = 'Error creating authorization invitation request'
    description = 'An error occurred creating authorization invitation. Please try again later.'
  }

  if (props.errorObj.type === 'other') {
    if (error.response?.status === StatusCodes.UNAUTHORIZED) {
      // emit('add-failed-invalid-code', passcodeLabel.value)
      title = 'Invalid LABEL HERE' // TODO: add label
      description = 'Unable to add the business. The provided LABEL HERE is invalid.'
    } else if (error.response?.status === StatusCodes.NOT_FOUND) {
      title = 'Business Not Found'
      description = 'The specified business was not found.'
    } else if (error.response?.status === StatusCodes.NOT_ACCEPTABLE) {
      title = 'Passcode Already Claimed'
      description = 'This passcode has already been claimed. If you have questions, please contact us' // TODO: add contact info to error modal
    } else if (error.response?.status === StatusCodes.BAD_REQUEST) {
      title = 'Business Already Added'
      description = 'The business BUSINESS NAME with the business number BUSINESS IDENTIFIER is already in your Business Registry List.' // TODO: add business name and identifier
    } else {
      title = 'Something Went Wrong'
      description = 'An error occurred, please try again. If this error persists, please contact us.'
    }
  }

  return { title, description }
})

const setScreenReaderAlert = (message: string) => {
  ariaAlertText.value = ''
  ariaAlertText.value = message
}

onMounted(() => {
  setTimeout(() => {
    setScreenReaderAlert(errorText.value.title + ' ' + apiErrorMsg.value + ' ' + errorText.value.description)
  }, 1000)
})
</script>
<template>
  <div class="flex flex-col items-center gap-4 text-center">
    <UIcon name="i-mdi-alert-circle-outline" class="size-8 text-red-500" />
    <h2 class="text-xl font-semibold">
      {{ errorText.title }}
    </h2>
    <p v-if="apiErrorMsg">
      {{ apiErrorMsg }}
    </p>
    <p>{{ errorText.description }}</p>
    <BCRegContactInfo class="self-start text-left" />
    <div class="flex gap-2">
      <UButton
        :label="$t('btn.cancel')"
        variant="outline"
        @click="brdModal.close()"
      />
      <UButton
        :label="$t('btn.tryAgain')"
        @click="$emit('retry')"
      />
    </div>
    <div class="sr-only" role="status">
      {{ ariaAlertText }}
    </div>
  </div>
</template>
