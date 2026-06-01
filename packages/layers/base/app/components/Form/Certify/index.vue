<script setup lang="ts">
import type { FormError, Form } from '@nuxt/ui'

const props = defineProps<{
  name?: string
  entityType?: string
  order?: string | number
}>()

const certifySchema = getCertifySchema()

const model = defineModel<CertifySchema>({ required: true })

const formRef = useTemplateRef<Form<CertifySchema>>('certify-form')

const formError = computed<FormError | undefined>(() => {
  const errors = formRef.value?.getErrors()
  return errors?.find(e => e.name === 'isCertified')
})

const today = getToday('America/Vancouver')

defineExpose({
  formRef
})
</script>

<template>
  <div class="space-y-6 bg-shade rounded p-6 border border-shade-secondary">
    <div class="space-y-2">
      <h2>{{ props.order ? `${props.order}. ${$t('label.certify')}` : $t('label.certify') }}</h2>
      <p>
        {{ $t('text.certifyDescription', { entityType: props.entityType || '[entity type]' }) }}
      </p>
    </div>
    <div class="p-2 bg-white rounded">
      <UForm
        ref="certify-form"
        :schema="certifySchema"
        nested
        :name
      >
        <ConnectFieldset
          :label="$t('label.certify')"
          :error="formError"
          :show-error-msg="true"
          padding-class="p-6"
          data-testid="certify-section"
        >
          <UFormField
            name="isCertified"
            :ui="{
              error: 'sr-only'
            }"
          >
            <template #default>
              <div class="bg-shade rounded p-4">
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
                      :entitytype="props.entityType || '[entity type]'"
                      class="text-neutral"
                    />
                  </template>
                </UCheckbox>
              </div>
              <div class="flex flex-col text-base gap-2 mt-4">
                <div>
                  <span class="font-bold">{{ $t('label.date') }}:</span>
                  {{ today }}
                </div>
                <ConnectI18nHelper
                  id="certify-description"
                  as="p"
                  translation-path="text.offenceToMakeMisleadingStatement"
                  :entitytype="props.entityType || '[entity type]'"
                />
              </div>
            </template>
          </UFormField>
        </ConnectFieldset>
      </UForm>
    </div>
  </div>
</template>
