<script setup lang="ts">
import type { FormError, Form } from '@nuxt/ui'

defineProps<{
  name?: string
  order?: string | number
}>()

const schema = getCourtOrderPoaSchema()

const model = defineModel<CourtOrderPoaSchema>({ required: true })

const formRef = useTemplateRef<Form<CourtOrderPoaSchema>>('court-order-poa-form')

const courtOrderNumberError = computed<FormError | undefined>(() => {
  const errors = formRef.value?.getErrors()
  return errors?.find(e => e.name === 'courtOrderNumber')
})

// checking PoA makes the number required right away, unchecking drops that requirement
async function onPoaChange() {
  await nextTick()
  // @ts-expect-error - name: 'courtOrderNumber' not being inferred correctly
  formRef.value?.validate({ name: 'courtOrderNumber', silent: true })
}

// an error already showing (ex: raised by checking PoA) updates as the number is typed
watch(() => model.value.courtOrderNumber, () => {
  if (courtOrderNumberError.value) {
    // @ts-expect-error - name: 'courtOrderNumber' not being inferred correctly
    formRef.value?.validate({ name: 'courtOrderNumber', silent: true })
  }
})

defineExpose({
  formRef
})
</script>

<template>
  <UForm
    ref="court-order-poa-form"
    :schema
    nested
    :name
  >
    <ConnectFieldset
      :label="order ? `${order}. ${$t('label.courtOrderAndPoa')}` : $t('label.courtOrderAndPoa')"
      body-variant="card"
      orientation="vertical"
      :error="courtOrderNumberError"
    >
      <div class="py-6">
        <ConnectFormFieldWrapper
          :label="$t('label.courtOrder')"
          orientation="horizontal"
        >
          <div class="flex flex-col gap-5">
            <UFormField
              name="courtOrderNumber"
              :description="$t('text.courtOrderNumberHint')"
              :ui="{
                description: 'text-base text-default mb-4',
                error: courtOrderNumberError ? 'mt-1 flex items-center gap-1 text-xs text-error' : 'mt-0'
              }"
            >
              <template #error="{ error }">
                <UIcon
                  v-if="error"
                  name="i-mdi-warning"
                  class="size-4 shrink-0"
                />
                <span data-testid="court-order-number-error" aria-live="polite">{{ error || '' }}</span>
              </template>
              <ConnectInput
                id="court-order-number-input"
                v-model="model.courtOrderNumber"
                :aria-required="model.hasPoa || undefined"
                :label="$t('label.courtOrderNumberIfExists')"
              />
            </UFormField>
            <UFormField name="hasPoa">
              <UCheckbox
                v-model="model.hasPoa"
                :label="$t('label.filingPursuantToPlanOfArrangement')"
                @update:model-value="onPoaChange"
              />
            </UFormField>
          </div>
        </ConnectFormFieldWrapper>
      </div>
    </ConnectFieldset>
  </UForm>
</template>
