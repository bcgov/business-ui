<script setup lang="ts">
import type { FormError, Form, RadioGroupItem, AcceptableValue } from '@nuxt/ui'
import { PartyType } from '#imports'

defineProps<{
  name?: string
  allowBusinessName?: boolean
  allowPreferredName?: boolean
}>()

const { t } = useI18n()

const partyNameSchema = getPartyNameSchema()

const model = defineModel<PartyNameSchema>({ required: true })

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
    nested
    :name
  >
    <ConnectFieldset :label="t('label.personOrOrgName')" :error="formErrors && formErrors[0]">
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
              :label="$t('label.haspreferredName')"
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
      </div>
    </ConnectFieldset>
  </UForm>
</template>
