<script setup lang="ts">
import type { FormError, Form } from '@nuxt/ui'

const props = defineProps<{
  name?: string
  entityType?: string
  order?: string | number
}>()

const confirmAuthorizationSchema = getConfirmAuthorizationSchema()

const model = defineModel<ConfirmAuthorizationSchema>({ required: true })

const formRef = useTemplateRef<Form<ConfirmAuthorizationSchema>>('confirm-authorization-form')

const formError = computed<FormError | undefined>(() => {
  const errors = formRef.value?.getErrors()
  return errors?.find(e => e.name === 'isAuthorized')
})

const today = getToday('America/Vancouver')

defineExpose({
  formRef
})
</script>

<template>
  <div class="space-y-6 bg-shade rounded p-6 border border-shade-secondary">
    <div class="space-y-2">
      <h2>
        {{ props.order ? `${props.order}. ${$t('label.confirmAuthorization')}` : $t('label.confirmAuthorization') }}
      </h2>
      <p>
        {{ $t('text.confirmAuthorizationDescription', { entityType: props.entityType || '[entity type]' }) }}
      </p>
    </div>
    <div class="p-2 bg-white rounded">
      <UForm
        ref="confirm-authorization-form"
        :schema="confirmAuthorizationSchema"
        nested
        :name
      >
        <ConnectFieldset
          :label="$t('label.confirmAuthorization')"
          :error="formError"
          :show-error-msg="true"
          padding-class="p-6"
          data-testid="confirm-authorization-section"
        >
          <UFormField
            name="isAuthorized"
            :ui="{
              error: 'sr-only'
            }"
          >
            <template #default="{ error }">
              <div
                class="bg-shade rounded shadow-xs border-l-3 p-4"
                :class="error ? 'border-error' : 'border-transparent'"
              >
                <UCheckbox
                  v-model="model.isAuthorized"
                  aria-describedby="confirm-authorization-description"
                  :ui="{
                    root: 'items-start',
                    label: 'text-base'
                  }"
                >
                  <template #label>
                    <ConnectI18nHelper
                      as="p"
                      translation-path="text.confirmAuthorizationIsAuthorized"
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
                  id="confirm-authorization-description"
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
