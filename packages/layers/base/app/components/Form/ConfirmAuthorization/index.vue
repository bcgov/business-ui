<script setup lang="ts">
import type { FormError, Form } from '@nuxt/ui'

const props = defineProps<{
  name?: string
  entityType?: string
  order?: string | number
}>()

const confirmAuthorizationSchema = getConfirmAuthorizationSchema()
const appConfig = useAppConfig()

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
  <div class="space-y-6 bg-shade rounded p-6">
    <div class="space-y-2">
      <h2>
        {{ props.order ? `${props.order}. ${$t('label.confirmAuthorization')}` : $t('label.confirmAuthorization') }}
      </h2>
      <p>
        {{ $t('text.confirmAuthorizationDescription', { entityType: props.entityType || '[entity type]' }) }}
      </p>
    </div>
    <UForm
      ref="confirm-authorization-form"
      class="bg-white rounded"
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
          <template #default>
            <div class="bg-shade rounded p-4">
              <UCheckbox
                v-model="model.isAuthorized"
                aria-describedby="confirm-authorization-description"
                :label="$t('text.confirmAuthorizationIsAuthorized', { entitytype: props.entityType || '[entity type]' })"
                :ui="appConfig.ui.checkbox.slots"
              />
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
</template>
