<script setup lang="ts">
import type { FormError, Form } from '@nuxt/ui'

defineProps<{
  name?: string
  order?: string | number
}>()

const completingPartySchema = getCompletingPartySchema()

const model = defineModel<CompletingPartySchema>({ required: true })

const formRef = useTemplateRef<Form<CompletingPartySchema>>('completing-party-form')

const nameErrors = computed<FormError | undefined>(() => {
  const errors = formRef.value?.getErrors()
  return errors?.find(e =>
    e.name === 'firstName' || e.name === 'middleName' || e.name === 'lastName'
  )
})

const addressErrors = computed<FormError | undefined>(() => {
  const errors = formRef.value?.getErrors()
  return errors?.find(e => e.name?.startsWith('mailingAddress'))
})

defineExpose({
  formRef
})
</script>

<template>
  <UForm
    ref="completing-party-form"
    :schema="completingPartySchema"
    nested
    :name
  >
    <ConnectFieldset
      :label="order ? `${order}. ${$t('label.completingParty')}` : $t('label.completingParty')"
      body-variant="card"
      data-testid="completing-party-section"
      orientation="vertical"
    >
      <!-- Person's Name -->
      <ConnectFormFieldWrapper
        :label="$t('label.personsName')"
        orientation="horizontal"
        :error="nameErrors"
        padding-class="xy-default"
      >
        <div class="flex flex-col gap-2 sm:gap-4 sm:flex-row">
          <ConnectFormInput
            v-model="model.firstName"
            data-testid="completing-party-first-name"
            name="firstName"
            input-id="completing-party-first-name-input"
            :label="$t('label.firstName')"
          />
          <ConnectFormInput
            v-model="model.middleName"
            data-testid="completing-party-middle-name"
            name="middleName"
            input-id="completing-party-middle-name-input"
            :label="$t('label.middleNameOpt')"
          />
          <ConnectFormInput
            v-model="model.lastName"
            data-testid="completing-party-last-name"
            name="lastName"
            input-id="completing-party-last-name-input"
            :label="$t('label.lastName')"
          />
        </div>
      </ConnectFormFieldWrapper>

      <!-- Mailing Address -->
      <ConnectFormFieldWrapper
        :label="$t('label.mailingAddress')"
        orientation="horizontal"
        :error="addressErrors"
      >
        <ConnectFormAddress
          id="completing-party-mailing-address"
          v-model="model.mailingAddress"
          schema-prefix="mailingAddress"
          @should-validate="formRef?.clear(/^mailingAddress.*/)"
        />
      </ConnectFormFieldWrapper>
    </ConnectFieldset>
  </UForm>
</template>
