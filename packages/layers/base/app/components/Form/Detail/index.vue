<script setup lang="ts">
import type { Form } from '@nuxt/ui'
import type { DetailSchema } from '../../../utils/schemas/detail'
import { getDetailSchema } from '../../../utils/schemas/detail'

const props = withDefaults(defineProps<{
  name?: string
  order?: string | number
  filingDate?: string
  description?: string
  maxLength?: number
}>(), {
  description: 'Enter a Detail that will appear on the ledger for this entity.',
  rowCount: 1,
  maxLength: 1945
})

const model = defineModel<DetailSchema>({ required: true })
const formRef = useTemplateRef<Form<DetailSchema>>('detail-form')
const formDetailTextareaId = useId()
const detailSchema = computed(() => getDetailSchema(props.maxLength))
const fieldsetLabel = computed(() => props.order ? `${props.order}. Detail` : 'Detail')
const characterCount = computed(() => model.value?.detail?.length ?? 0)
const correctionLabel = computed(() => {
  return props.filingDate
    ? `Correction for Registration filed on ${props.filingDate}`
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
      :description="props.description"
      body-variant="card"
      orientation="vertical"
    >
      <ConnectFormFieldWrapper
        :label="$t('label.detail')"
        :showErrorMsg="true"
      >
        <div class="flex w-full flex-col gap-2">
          <label
            v-if="correctionLabel"
            :for="formDetailTextareaId"
            class="font-semibold text-neutral-highlighted"
          >
            {{ correctionLabel }}
          </label>
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
