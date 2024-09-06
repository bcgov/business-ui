<script setup lang="ts">
import { FetchError } from 'ofetch'

// const { t } = useI18n() // TODO: add translations
const brdModal = useBrdModals()

const props = defineProps<{
  error: FetchError
}>()

defineEmits<{
  retry: [void]
}>()

const ariaAlertText = ref('')
const errorText = computed(() => {
  const message = props.error?.data?.message
  const title = 'Error Sending Authorization Email'
  let description = ''

  if (message) {
    description = message
  } else {
    description = 'An error occurred sending authorization email. Please try again.'
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
        @click="$emit('retry')"
      />
    </div>
    <div class="sr-only" role="status">
      {{ ariaAlertText }}
    </div>
  </div>
</template>
