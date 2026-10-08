<script setup lang="ts">
import type { FormError, Form } from '@nuxt/ui'

defineProps<{
  name?: string
  order?: string | number
  description?: string
}>()

const schema = getForeignJurisdictionSchema()

const model = defineModel<ForeignJurisdictionSchema>({ required: true })

const formRef = useTemplateRef<Form<ForeignJurisdictionSchema>>('foreign-jurisdiction-form')

const formError = computed<FormError | undefined>(() => {
  const errors = formRef.value?.getErrors()
  return errors && errors[0]
})

defineExpose({
  formRef
})
</script>

<template>
  <!-- nested forms resolve their state from the parent form via `name` (DocumentDelivery pattern) -->
  <UForm
    ref="foreign-jurisdiction-form"
    data-testid="foreign-jurisdiction-section"
    :schema
    :name
    nested
  >
    <ConnectFieldset
      :label="order ? `${order}. ${$t('label.jurisdiction')}` : $t('label.jurisdiction')"
      :description
      :error="formError"
      body-variant="card"
      orientation="vertical"
    >
      <div class="py-6">
        <ConnectFormFieldWrapper
          :label="$t('label.jurisdiction')"
          orientation="horizontal"
          :error="formError"
          show-error-msg
        >
          <FormForeignJurisdictionField
            v-model="model"
            data-testid="jurisdiction-menu"
            @change="formRef?.clear()"
          />
        </ConnectFormFieldWrapper>
      </div>
    </ConnectFieldset>
  </UForm>
</template>
