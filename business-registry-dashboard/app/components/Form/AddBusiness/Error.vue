<script setup lang="ts">
import { FetchError } from 'ofetch'
import { StatusCodes } from 'http-status-codes'
const { t } = useI18n()
const brdModal = useBrdModals()

const props = defineProps<{
  errorObj: {error: FetchError, type: 'email' | 'delegation' | 'firm' | 'passcode'}
  businessDetails: {
    isFirm: boolean
    isCorporation: boolean
    isBenefit: boolean
    isCorpOrBenOrCoop: boolean
    isCoop: boolean
    name: string
    identifier: string
  }
}>()

defineEmits<{
  retry: [void]
}>()

// const apiErrorMsg = computed<string | null>(() => props.errorObj.error?.data?.message ?? null) // TODO: do we want to include the error message from the backend?

const ariaAlertText = ref('')
const errorText = computed(() => {
  const error = props.errorObj.error
  let title = ''
  let description = ''

  if (props.errorObj.type === 'email') {
    title = t('form.manageBusiness.error.email.title')
    description = t('form.manageBusiness.error.email.description')
  }

  if (props.errorObj.type === 'delegation') {
    title = t('form.manageBusiness.error.delegation.title')
    description = t('form.manageBusiness.error.delegation.description')
  }

  if (props.errorObj.type === 'passcode') {
    if (error.response?.status === StatusCodes.UNAUTHORIZED) {
      if (props.businessDetails.isCoop) {
        title = t('form.manageBusiness.error.passcode.401.coop.title')
        description = t('form.manageBusiness.error.passcode.401.coop.description')
      } else {
        title = t('form.manageBusiness.error.passcode.401.default.title')
        description = t('form.manageBusiness.error.passcode.401.default.description')
      }
    } else if (error.response?.status === StatusCodes.NOT_FOUND) {
      title = t('form.manageBusiness.error.passcode.404.title')
      description = t('form.manageBusiness.error.passcode.404.description')
    } else if (error.response?.status === StatusCodes.NOT_ACCEPTABLE) {
      title = t('form.manageBusiness.error.passcode.406.title')
      description = t('form.manageBusiness.error.passcode.406.description')
    } else if (error.response?.status === StatusCodes.BAD_REQUEST) {
      title = t('form.manageBusiness.error.passcode.400.title')
      description = t('form.manageBusiness.error.passcode.400.description', { name: props.businessDetails.name, identifier: props.businessDetails.identifier })
    } else {
      title = t('form.manageBusiness.error.passcode.default.title')
      description = t('form.manageBusiness.error.passcode.default.description')
    }
  }

  if (props.errorObj.type === 'firm') {
    if (error.response?.status === StatusCodes.UNAUTHORIZED) {
      title = t('form.manageBusiness.error.firm.401.title')
      description = t('form.manageBusiness.error.firm.401.description')
    } else if (error.response?.status === StatusCodes.NOT_FOUND) {
      title = t('form.manageBusiness.error.firm.404.title')
      description = t('form.manageBusiness.error.firm.404.description')
    } else if (error.response?.status === StatusCodes.BAD_REQUEST) {
      title = t('form.manageBusiness.error.firm.400.title')
      description = t('form.manageBusiness.error.firm.400.description', { name: props.businessDetails.name, identifier: props.businessDetails.identifier })
    } else {
      title = t('form.manageBusiness.error.firm.default.title')
      description = t('form.manageBusiness.error.firm.default.description')
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
    setScreenReaderAlert(errorText.value.title + ' ' + errorText.value.description)
    // setScreenReaderAlert(errorText.value.title + ' ' + apiErrorMsg.value + ' ' + errorText.value.description)
  }, 1000)
})
</script>
<template>
  <div class="flex flex-col items-center gap-4 text-center">
    <UIcon name="i-mdi-alert-circle-outline" class="size-8 text-red-500" />
    <h2 class="text-xl font-semibold">
      {{ errorText.title }}
    </h2>
    <!-- <p v-if="apiErrorMsg">
      {{ apiErrorMsg }}
    </p> -->
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
