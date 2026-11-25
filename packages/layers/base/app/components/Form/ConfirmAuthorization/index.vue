<script setup lang="ts">
import type { FormError, Form } from '@nuxt/ui'

const props = defineProps<{
  name?: string
  entityType?: string
  order?: string | number
  /** Staff only: shows the Completing Party name field and uses the completing party wording */
  showCompletingParty?: boolean
}>()

const { t } = useI18n()

const confirmAuthorizationSchema = computed(() =>
  props.showCompletingParty ? getConfirmAuthorizationStaffSchema() : getConfirmAuthorizationSchema()
)

const model = defineModel<ConfirmAuthorizationSchema>({ required: true })

const formRef = useTemplateRef<Form<ConfirmAuthorizationSchema>>('confirm-authorization-form')

const formError = computed<FormError | undefined>(() =>
  formRef.value?.getErrors()?.find(e => e.name === 'isAuthorized')
)
const completingPartyError = computed<FormError | undefined>(() =>
  formRef.value?.getErrors()?.find(e => e.name === 'completingParty')
)

// Completing Party takes the given order; Authorization follows it when shown
const authorizationOrder = computed(() => {
  if (!props.order) {
    return undefined
  }
  return props.showCompletingParty ? Number(props.order) + 1 : props.order
})

const entityType = computed(() => props.entityType || '[entity type]')
const completingPartyName = computed(() => model.value.completingParty?.trim() || '[Completing Party]')

const authorizationLabel = computed(() =>
  props.showCompletingParty
    ? t('text.confirmAuthorizationIsAuthorizedStaff', {
      completingParty: completingPartyName.value,
      entityType: entityType.value
    })
    : t('text.confirmAuthorizationIsAuthorized', {
      entitytype: entityType.value
    })
)

const today = toReadableDate(getToday())

defineExpose({
  formRef
})
</script>

<template>
  <UForm
    ref="confirm-authorization-form"
    :schema="confirmAuthorizationSchema"
    nested
    :name
  >
    <!-- Completing Party (staff only) -->
    <div
      v-if="props.showCompletingParty"
      class="space-y-6 bg-shade rounded pb-6"
      data-testid="completing-party-section"
    >
      <h2>
        {{ props.order ? `${props.order}. ${$t('label.completingParty')}` : $t('label.completingParty') }}
      </h2>
      <div class="bg-white rounded w-full">
        <ConnectFieldset
          :label="$t('label.completingParty')"
          :error="completingPartyError"
          :show-error-msg="false"
          padding-class="padding-x-default py-8"
        >
          <ConnectFormInput
            v-model="model.completingParty"
            input-id="completing-party-input"
            :label="$t('label.legalNameOfCompletingParty')"
            name="completingParty"
            data-testid="completing-party-input"
          />
        </ConnectFieldset>
      </div>
    </div>

    <!-- Authorization -->
    <div class="space-y-6 bg-shade rounded">
      <div class="space-y-2">
        <h2>
          {{ authorizationOrder ? `${authorizationOrder}. ${$t('label.authorization')}` : $t('label.authorization') }}
        </h2>
        <p>
          {{
            props.showCompletingParty
              ? $t('text.confirmAuthorizationDescriptionStaff', { entityType })
              : $t('text.confirmAuthorizationDescription', { entityType })
          }}
        </p>
      </div>

      <div class="bg-white rounded w-full">
        <ConnectFieldset
          :label="$t('label.confirmAuthorization')"
          :error="formError"
          :show-error-msg="true"
          padding-class="padding-x-default py-8"
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
                  :aria-label="authorizationLabel"
                  :ui="{ label: 'group-has-[button[aria-invalid=true]]:text-inherit' }"
                  :label="authorizationLabel"
                />
              </div>
              <div class="flex flex-col text-base gap-2 mt-4">
                <div class="font-bold">
                  {{ $t('label.date') }}: {{ today }}
                </div>
                <ConnectI18nHelper
                  id="confirm-authorization-description"
                  as="p"
                  translation-path="text.offenceToMakeMisleadingStatement"
                  :entitytype="entityType"
                />
              </div>
            </template>
          </UFormField>
        </ConnectFieldset>
      </div>
    </div>
  </UForm>
</template>
