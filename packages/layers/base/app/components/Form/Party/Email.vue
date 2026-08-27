<script setup lang="ts">
import type { Form, FormError } from '@nuxt/ui'

const { required = true } = defineProps<{
  required?: boolean
}>()

const model = defineModel<string>({ required: true })

const partyEmailSchema = getPartyEmailSchema(required)

const localState = reactive<PartyEmailSchema>({ email: model.value })

const formRef = useTemplateRef<Form<PartyEmailSchema>>('party-email-form')

const formError = computed<FormError | undefined>(() =>
  formRef.value?.getErrors().find(error => error.name === 'email')
)

watch(() => localState.email, (val) => {
  model.value = val ?? ''
})

defineExpose({
  formRef
})
</script>

<template>
  <UForm
    ref="party-email-form"
    :schema="partyEmailSchema"
    :state="localState"
  >
    <ConnectFormFieldWrapper
      :label="required ? $t('label.emailAddress') : $t('label.emailAddressOpt')"
      orientation="horizontal"
      :error="formError"
      padding-class="xy-default"
    >
      <ConnectFormInput
        v-model="localState.email"
        input-id="party-email-input"
        name="email"
        :required
        :label="$t('label.enterEmailAddress')"
      />
    </ConnectFormFieldWrapper>
  </UForm>
</template>
