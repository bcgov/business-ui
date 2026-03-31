<script setup lang="ts">
import type { FormErrorEvent } from '@nuxt/ui'

const {
  businessIdentifier,
  businessType,
  companyName,
  correctNameOptions,
  filingName,
  nrAllowedActionTypes,
  name,
  stateKey = 'business-name'
} = defineProps<{
  businessIdentifier: string
  businessType: CorpTypeCd
  companyName: string
  correctNameOptions: CorrectNameOption[]
  filingName: string
  nrAllowedActionTypes: NrRequestActionCode[]
  name?: string
  stateKey?: string
}>()

const model = defineModel<NameRequestSchema>({ required: true })

const emit = defineEmits<{
  done: []
  cancel: []
}>()

const schema = getNameRequestSchema()

const { t } = useNuxtApp().$i18n
const { alerts, attachAlerts } = useFilingAlerts(stateKey)
const formTarget = 'company-name-form'

const numberedName = `${businessIdentifier} B.C. ${getNumberedDesignation(businessType)}`

const nameChangeOptions = computed<BusinessNameChangeOption[]>(() => [
  // FUTURE: add in AML CorrectNameOption values
  ...(
    correctNameOptions.includes(CorrectNameOption.CORRECT_NAME)
      ? [{ label: t('label.editTheCompanyName'), changeOption: CorrectNameOption.CORRECT_NAME }]
      : []
  ),
  ...(
    correctNameOptions.includes(CorrectNameOption.CORRECT_NAME_TO_NUMBER)
      ? [{ label: t('label.useTheCorporationNumberAsTheName'), changeOption: CorrectNameOption.CORRECT_NAME_TO_NUMBER }]
      : []
  ),
  ...(
    correctNameOptions.includes(CorrectNameOption.CORRECT_NEW_NR)
      ? [{ label: t('label.useANewNameRequestNumber'), changeOption: CorrectNameOption.CORRECT_NEW_NR }]
      : []
  )
])

// TODO
// const editNameFormRef =
// const nrNumFormRef =

async function onDone() {
  try {
    // TODO
    // need to validate child ref to get input IDs
    // await addressFormRef.value?.formRef?.validate()

    emit('done')
  } catch (e) {
    onFormSubmitError(e as FormErrorEvent)
  }
}

const { targetId, messageId } = attachAlerts(formTarget, model)

// TODO: set companyName when doing edit name expansion if nameRequest.legalName is empty
// TODO: watch model.changeToNumbered and set nameRequest.legalName to numberedName when checking box
</script>

<template>
  <UForm
    :data-testid="formTarget"
    :schema
    :name
    nested
  >
    <Divide orientation="vertical">
      <p>
        {{ $t('text.youCanCorrectFollowingWays') }}
      </p>
      <UAccordion
        :items="nameChangeOptions"
        :ui="{ trigger: 'text-primary py-6' }"
      >
        <template #default="{ item }">
          <!-- TODO: set label class based on active open accordion (can use v-model on it I think) -->
          <p class="text-base">
            {{ item.label }}
          </p>
        </template>
        <template #content="{ item }">
          <div class="py-6 px-3">
            <div v-if="item.changeOption === CorrectNameOption.CORRECT_NAME">
              <FormBusinessNameEdit v-model="model" />
            </div>
            <div v-else-if="item.changeOption === CorrectNameOption.CORRECT_NAME_TO_NUMBER">
              <UCheckbox
                v-model="model.changeToNumbered"
                :label="$t('label.changeCompanyNameToNumbered', { numberedName })"
              />
            </div>
            <div v-else>
              <!-- CorrectNameOption.CORRECT_NEW_NR -->
              <FormNameRequestNumber
                v-model="model"
                :business-type
                :filing-name
                :nr-allowed-action-types
              />
            </div>
          </div>
        </template>
      </UAccordion>
    </Divide>
    <div class="flex flex-col sm:flex-row gap-2 sm:gap-6 justify-end items-center mt-6">
      <FormAlertMessage
        :id="messageId"
        :message="alerts[formTarget]"
      />
      <UButton
        variant="outline"
        :label="t('label.cancel')"
        class="w-full sm:w-min justify-center"
        @click="$emit('cancel')"
      />
      <UButton
        :data-alert-focus-target="targetId"
        :aria-describedby="messageId"
        :label="t('label.done')"
        class="w-full sm:w-min justify-center"
        @click="onDone"
      />
    </div>
  </UForm>
</template>
