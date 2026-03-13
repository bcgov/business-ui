<script setup lang="ts">
import type { Form } from '@nuxt/ui'

const { t } = useI18n()

const props = withDefaults(defineProps<{
  name?: string
  order?: string | number
  filingDate?: string
  description?: string
  maxLength?: number
}>(), {
  maxLength: 1945
})

const model = defineModel<DetailSchema>({ required: true })
const formRef = useTemplateRef<Form<DetailSchema>>('detail-form')
const formDetailTextareaId = useId()
const detailSchema = computed(() => getDetailSchema(props.maxLength))
const fieldsetLabel = computed(() => props.order ? `${props.order}. ${t('label.detail')}` : t('label.detail'))
const fieldsetDescription = computed(() => props.description ?? t('text.detailDescription'))
const characterCount = computed(() => model.value?.detail?.length ?? 0)
const correctionLabel = computed(() => {
  return props.filingDate
    ? t('text.correctionForRegistrationFiledOn', { date: props.filingDate })
    : undefined
})

defineExpose({
  formRef
})
</script>

<template>
  <UForm
    ref="detail-form"
    :schema="detailSchema"
    class="gap-6 flex flex-col"
    nested
    :name="props.name"
  >
    <ConnectFieldset
      :label="fieldsetLabel"
      :description="fieldsetDescription"
      body-variant="card"
      orientation="vertical"
    >
      <ConnectFormFieldWrapper
        :label="$t('label.detail')"
        :show-error-msg="true"
        class="pt-5"
      >
        <div class="flex w-full flex-col gap-2">
          <p
            v-if="correctionLabel"
            class="font-semibold text-neutral-highlighted"
          >
            {{ correctionLabel }}
          </p>
          <UFormField
            name="detail"
            eager-validation
            class="grow flex-1"
          >
            <template #default="{ error }">
              <ConnectTextarea
                :id="formDetailTextareaId"
                v-model="model.detail"
                :label="$t('label.detail')"
                autoresize
              />
              <div
                v-if="!error"
                class="h-4 mt-1"
              />
            </template>
          </UFormField>
          <div
            class="text-right text-sm"
            :class="characterCount > props.maxLength ? 'text-error' : 'text-neutral'"
          >
            {{ characterCount }} / {{ props.maxLength }}
          </div>
        </div>
      </ConnectFormFieldWrapper>
    </ConnectFieldset>
  </UForm>
</template>
