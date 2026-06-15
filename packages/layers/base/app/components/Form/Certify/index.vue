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
  <div class="space-y-6 bg-shade rounded pt-6">
    <div class="space-y-2">
      <h2>{{ props.order ? `${props.order}. ${$t('label.certify')}` : $t('label.certify') }}</h2>
      <p>
        {{ $t('text.certifyDescription', { entityType: props.entityType || '[entity type]' }) }}
      </p>
    </div>
    <UForm
      ref="certify-form"
      class="bg-white rounded w-full"
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
                :label="$t('text.certifyIsAuthorized', { entitytype: props.entityType || '[entity type]' })"
              />
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
</template>
