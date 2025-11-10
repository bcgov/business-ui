<script setup lang="ts">
import type { FormError, Form } from '@nuxt/ui'

defineProps<{
  name?: string
  order?: string | number
  description?: string
}>()

const certifySchema = getCertifySchema()

const model = defineModel<CertifySchema>({ required: true })

const formRef = useTemplateRef<Form<CertifySchema>>('certify-form')

const legalNameError = computed<FormError | undefined>(() => {
  const errors = formRef.value?.getErrors()
  return errors?.find(e => e.name === 'legalName')
})

const today = getToday('America/Vancouver')

defineExpose({
  formRef
})
</script>

<template>
  <UForm
    ref="certify-form"
    :schema="certifySchema"
    nested
    :name
  >
    <ConnectFieldset
      :label="order ? `${order}. ${$t('label.certify')}` : $t('label.certify')"
      :description
      body-variant="card"
    >
      <ConnectFormFieldWrapper
        :label="$t('label.legalName')"
        orientation="horizontal"
        :error="legalNameError"
      >
        <div class="flex flex-col gap-4">
          <ConnectFormInput
            v-model="model.legalName"
            input-id="legal-name-input"
            :label="$t('label.legalNameOfAuthorizedPerson')"
            name="legalName"
          />
          <UFormField
            name="isCertified"
            :ui="{
              error: 'sr-only'
            }"
          >
            <template #default="{ error }">
              <UCheckbox
                v-model="model.isCertified"
                aria-describedby="certify-description"
                :ui="{
                  root: 'items-start',
                  label: 'text-base'
                }"
              >
                <template #label>
                  <ConnectI18nHelper
                    as="p"
                    translation-path="text.certifyIsAuthorized"
                    :legalname="model.legalName || '[LEGAL NAME]'"
                    :class="error ? 'text-error' : 'text-neutral'"
                  />
                </template>
              </UCheckbox>
              <div class="flex flex-col text-base gap-2 mt-2 ml-8">
                <div>
                  <span class="font-bold">{{ $t('label.date') }}:</span>
                  {{ today }}
                </div>
                <ConnectI18nHelper
                  id="certify-description"
                  as="p"
                  translation-path="text.offenceToMakeMisleadingStatement"
                />
              </div>
            </template>
          </UFormField>
        </div>
      </ConnectFormFieldWrapper>
    </ConnectFieldset>
  </UForm>
</template>
