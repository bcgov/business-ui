<script setup lang="ts">
import type { Form } from '@nuxt/ui'

defineProps<{ name?: string }>()

const model = defineModel<NameRequestSchema>({ required: true })

// We only care about legalName for this component
const schema = getNameRequestSchema().pick({ legalName: true })

const formRef = useTemplateRef<Form<NameRequestSchema>>('company-name-edit-form')

defineExpose({ formRef })
</script>

<template>
  <UForm
    ref="company-name-edit-form"
    :schema="schema"
    nested
    :name
  >
    <p>{{ $t('text.correctTyposCompanyName') }}</p>
    <ConnectFormInput
      v-model="model.legalName"
      class="mt-3"
      data-testid="form-group-company-name"
      input-id="company-name-input"
      :label="$t('label.companyName')"
      name="legalName"
    />
  </UForm>
</template>
