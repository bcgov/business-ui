<script setup lang="ts">
import type { Form } from '@nuxt/ui'

defineProps<{ name?: string }>()

const model = defineModel<NameRequestSchema>({ required: true })
const schema = getNameRequestSchema()
const formRef = useTemplateRef<Form<NameRequestSchema>>('company-name-edit-form')

// need to init changeOption for validation refinements
// use along with onMounted so this is fired when used inside a <KeepAlive>
onActivated(() => model.value.changeOption = CorrectNameOption.CORRECT_NAME)
onMounted(() => model.value.changeOption = CorrectNameOption.CORRECT_NAME)

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
