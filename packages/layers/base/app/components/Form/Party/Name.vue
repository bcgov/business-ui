<script setup lang="ts">
import type { FormError, Form, RadioGroupItem, AcceptableValue } from '@nuxt/ui'
import { PartyType } from '#imports'

defineProps<{
  name?: string
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
      break
    default:
      break
  }

  formRef.value?.clear()
}

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
    <!-- :state="model" -->
    <ConnectFieldset :label="t('label.personOrOrgName')" :error="formErrors && formErrors[0]">
      <div class="space-y-6">
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
        <div v-if="model.partyType === PartyType.PERSON" class="flex flex-col gap-2 sm:gap-4 sm:flex-row">
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
