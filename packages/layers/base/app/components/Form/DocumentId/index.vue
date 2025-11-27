<script setup lang="ts">
import type { FormError, Form } from '@nuxt/ui'

const { getDocumentId } = useDocumentRecordServiceApi()

defineProps<{
  name?: string
  order?: string | number
}>()

const isLoading = ref(false)
const statusCode = ref<number | null>(null)

// Build schema dynamically based on statusCode
const docIdSchema = computed(() => getDocumentIdSchema(statusCode.value))

const model = defineModel<DocumentIdSchema>({ required: true })

const formRef = useTemplateRef<Form<DocumentIdSchema>>('document-id-form')

defineExpose({
  formRef
})

// Computed get error for documentIdNumber field
const documentIdError = computed<FormError | undefined>(() => {
  const errors = formRef.value?.getErrors()
  return errors?.find(e => e.name === 'documentIdNumber')
})

// Watch for 8 characters and trigger validation API call
watch(
  () => model.value.documentIdNumber,
  async (newVal) => {
    if ((newVal?.length ?? 0) === 8) {
      isLoading.value = true
      try {
        const response = await getDocumentId(newVal)
        statusCode.value = response.status
      } catch (err: Error) {
        statusCode.value = err?.response?.status || 500
      } finally {
        isLoading.value = false
        // Trigger validation after statusCode changes
        nextTick(() => {
          formRef.value?.validate().catch(() => {})
        })
      }
    } else {
      statusCode.value = null
    }
  }
)

// Compute UInput props based on loading state and status code
const uInputProps = computed<InputProps>(() => {
  const iconMap: Record<number, { class: string, name: string }> = {
    404: { class: 'text-success size-7', name: 'i-mdi-check' },
    400: { class: 'text-error size-7', name: 'i-mdi-close' },
    200: { class: 'text-error size-7', name: 'i-mdi-close' }
  }

  const icon = statusCode.value ? iconMap[statusCode.value] : null

  return {
    loading: isLoading.value,
    trailing: true,
    ui: {
      trailingIcon: icon?.class || 'text-primary size-7'
    },
    trailingIcon: icon?.name,
    maxLength: 8
  }
})

// Provide custom props for UInput
provide('UInput-props-document-id-number-input', uInputProps)
</script>

<template>
  <UForm
    ref="document-id-form"
    :schema="docIdSchema"
    nested
    :name
  >
    <ConnectFieldset
      :label="order ? `${order}. ${$t('label.documentId')}` : $t('label.documentId')"
      :description="$t('text.documentIdDescription')"
      body-variant="card"
    >
      <div class="flex flex-col gap-4">
        <ConnectFormFieldWrapper
          :label="$t('label.documentId')"
          orientation="horizontal"
          :error="documentIdError"
        >
          <ConnectFormInput
            v-model="model.documentIdNumber"
            name="documentIdNumber"
            input-id="document-id-number-input"
            :label="$t('label.documentIdOpt')"
          />
        </ConnectFormFieldWrapper>
      </div>
    </ConnectFieldset>
  </UForm>
</template>
