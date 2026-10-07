<script setup lang="ts">
import { isEqual } from 'es-toolkit'
import type { FormError, Form, RadioGroupItem, AcceptableValue } from '@nuxt/ui'
import { PartyType } from '#imports'

const { requireNameChangeConfirmation, originalName } = defineProps<{
  name?: string
  allowBusinessName?: boolean
  allowPreferredName?: boolean
  requireNameChangeConfirmation?: boolean
  originalName?: PartyNameSchema
}>()

const { t } = useI18n()

// eslint-disable-next-line max-len
const REGISTER_CORRECTION_FORM_URL = 'https://www2.gov.bc.ca/assets/gov/employment-business-and-economic-development/business-management/permits-licences-and-registration/registries-forms/register_correction_form_47.pdf'

const partyNameSchema = getPartyNameSchema()

const model = defineModel<PartyNameSchema>({ required: true })

// the confirmation is UI-only gating state - deliberately kept out of the name model so an
// unchanged name never diffs as changed in applyTableEdits and nothing is ever serialized
const nameChangeConfirmed = ref(false)
// same comparison applyTableEdits uses to emit NAME_CHANGED, so the checkbox appears
// exactly when the edit would be recorded as a legal name change
const isConfirmationRequired = computed(() =>
  !!requireNameChangeConfirmation
  && !!originalName
  && !isEqual({ ...model.value }, { ...originalName })
)

// runs alongside the schema in the form's validation pipeline, so the confirmation error
// surfaces through validate()/getErrors() like any schema error
function validateNameChangeConfirmation(): FormError[] {
  if (isConfirmationRequired.value && !nameChangeConfirmed.value) {
    return [{ name: 'nameChangeConfirmed', message: t('validation.confirmLegalNameChange') }]
  }
  return []
}

const radioOptions: RadioGroupItem[] = [
  {
    label: t('label.individualPerson'),
    value: PartyType.PERSON
  },
  {
    label: t('label.business'),
    value: PartyType.ORGANIZATION
  }
]

const formRef = useTemplateRef<Form<PartyNameSchema>>('party-name-form')

const formErrors = computed<FormError[] | undefined>(() => formRef.value?.getErrors())
const confirmationError = computed<FormError | undefined>(() =>
  formErrors.value?.find(e => e.name === 'nameChangeConfirmed')
)

// reverting the name retracts the confirmation, so a later name change starts unchecked
watch(isConfirmationRequired, (required) => {
  if (!required) {
    nameChangeConfirmed.value = false
    formRef.value?.clear('nameChangeConfirmed')
  }
})

function resetFields(value: AcceptableValue | undefined) {
  switch (value) {
    case PartyType.PERSON:
      model.value.businessName = ''
      break
    case PartyType.ORGANIZATION:
      model.value.firstName = ''
      model.value.middleName = ''
      model.value.lastName = ''
      model.value.hasPreferredName = false
      break
    default:
      break
  }

  formRef.value?.clear()
}

// reset preferred name field if user unselects checkbox
watch(() => model.value.hasPreferredName, (v) => {
  if (!v) {
    model.value.preferredName = ''
    formRef.value?.clear('preferredName')
  }
})

defineExpose({
  formRef
})
</script>

<template>
  <UForm
    ref="party-name-form"
    :schema="partyNameSchema"
    :validate="validateNameChangeConfirmation"
    nested
    :name
  >
    <ConnectFieldset
      :label="t('label.legalName')"
      :error="confirmationError || (formErrors && formErrors[0])"
      :show-error-msg="!!confirmationError"
      padding-class="xy-default"
    >
      <div class="space-y-6">
        <div v-if="allowBusinessName" class="space-y-6">
          <URadioGroup
            v-model="model.partyType"
            color="primary"
            variant="card"
            :items="radioOptions"
            orientation="horizontal"
            :ui="{
              base: 'ring-neutral',
              item: 'rounded flex-1 not-has-data-[state=checked]:bg-shade'
            }"
            @update:model-value="resetFields"
          />
          <USeparator />
        </div>
        <div v-if="model.partyType === PartyType.PERSON" class="space-y-2">
          <div class="flex flex-col gap-2 sm:gap-4 sm:flex-row">
            <ConnectFormInput
              v-model="model.firstName"
              data-testid="form-group-first-name"
              name="firstName"
              input-id="first-name-input"
              :label="t('label.firstName')"
            />

            <ConnectFormInput
              v-model="model.middleName"
              data-testid="form-group-middle-name"
              name="middleName"
              input-id="middle-name-input"
              :label="t('label.middleNameOpt')"
            />

            <ConnectFormInput
              v-model="model.lastName"
              data-testid="form-group-last-name"
              name="lastName"
              input-id="last-name-input"
              required
              :label="t('label.lastName')"
            />
          </div>
          <div v-if="allowPreferredName">
            <UCheckbox
              v-model="model.hasPreferredName"
              :label="$t('text.haspreferredName')"
              :ui="{ root: 'items-center' }"
              :class="model.hasPreferredName ? 'mb-6' : ''"
            />
            <ConnectFormInput
              v-if="model.hasPreferredName"
              v-model="model.preferredName"
              data-testid="form-group-preferred-name"
              name="preferredName"
              input-id="preferred-name-input"
              :label="t('label.preferredNameOpt')"
            />
          </div>
        </div>
        <ConnectFormInput
          v-else-if="model.partyType === PartyType.ORGANIZATION"
          v-model="model.businessName"
          data-testid="form-group-business-name"
          name="businessName"
          input-id="business-name-input"
          required
          :label="t('label.businessName')"
        />
        <div
          v-if="isConfirmationRequired"
          class="space-y-4"
          data-testid="name-change-confirmation"
        >
          <UFormField
            name="nameChangeConfirmed"
            :ui="{
              error: 'sr-only'
            }"
          >
            <UCheckbox
              id="name-change-confirm-checkbox"
              v-model="nameChangeConfirmed"
              :label="t('text.confirmLegalNameChange')"
              :ui="{ root: 'items-start' }"
            />
          </UFormField>
          <!-- NB: icon + text should be inline with checkbox + text -->
          <div class="flex items-start" data-testid="name-change-spelling-hint">
            <UIcon name="i-mdi-information-outline" class="ml-[-2px] size-6 text-primary" />
            <i18n-t
              keypath="text.legalNameChangeSpellingHint"
              tag="p"
              scope="global"
              class="ms-3 text-base"
            >
              <template #link>
                <UButton
                  :to="REGISTER_CORRECTION_FORM_URL"
                  target="_blank"
                  variant="link"
                  class="underline text-primary p-0 text-base gap-1"
                  trailing-icon="i-mdi-open-in-new"
                >
                  {{ t('label.registerCorrectionForm') }}
                </UButton>
              </template>
            </i18n-t>
          </div>
        </div>
      </div>
    </ConnectFieldset>
  </UForm>
</template>
