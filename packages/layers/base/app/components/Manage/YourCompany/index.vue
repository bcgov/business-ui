<script setup lang="ts">
import type { Form, FormErrorEvent } from '@nuxt/ui'
import type { ManageCompanyNameProps } from '#business/app/interfaces'

const {
  stateKey = 'manage-your-company',
  business,
  contact,
  variant = 'default',
  correctNameOptions,
  nrAllowedActionsTypes,
  nameTranslationAllowedActions,
  preventActions = false,
  actionPreventedSignal = 0,
  nested = true
} = defineProps<ManageCompanyNameProps & { preventActions?: boolean, actionPreventedSignal?: number, businessExtended?: BusinessDataExtended, nested?: boolean }>()

const emit = defineEmits<{
  'action-prevented': []
}>()

const activeSubject = defineModel<ActiveYourCompanySchema>('active-subject')
const activeNameRequest = defineModel<ActiveNameRequestSchema | undefined>('active-name-request')
const activeNt = defineModel<ActiveNameTranslationSchema | undefined>('active-nt')

const formRef = useTemplateRef<Form<ActiveYourCompanySchema>>('form-ref')

// const schema = getNameRequestSchema()
const {
  state,
  nrDetails,
  editSubject,
  undoSubject
} = useManageYourCompany(stateKey, {
  cleanupFn: cleanupForm
})

const schema = getActiveYourCompanySchema()

const {
  isReadOnlyVariant,
  shouldPreventActions,
  tableAllowedActions,
  tableLabels,
  setActiveSubjectAlert,
  clearAllAlerts
} = useManageCommon({
  stateKey,
  variant,
  // allowedActions,
  // labelOverrides,
  preventActions,
  actionPreventedSignal,
  activeSubjects: [
    {
      subject: activeSubject,
      alertTarget: 'new-juridiction-name'
    },
    {
      subject: activeSubject,
      alertTarget: 'company-name-form'
    }
  ]
})

// function initEdit() {
//   if (shouldPreventActions.value) {
//     setActiveFormAlert()
//     emit('action-prevented')
//     return
//   }
//   activeNameRequest.value = schema.parse({})
// }

// function setActiveFormAlert() {
//   if (activeNameRequest.value !== undefined) {
//     setAlert('company-name-form', t('text.finishTaskBeforeOtherChanges'))
//   }
// }

function onInitEdit<K extends keyof ManageYourCompanyFields>(key: K) {
  console.log('company name init edit')
  if (shouldPreventActions.value) {
    console.log('preventing actions')
    setActiveSubjectAlert()
    emit('action-prevented')
    return
  }

  const subject = state.value.new[key] as ManageYourCompanyFieldState<any> | undefined

  if (!subject) {
    return
  }

  activeSubject.value = {
    key,
    value: subject.value
  } as ActiveYourCompanySchema
}

function onUndo<K extends keyof ManageYourCompanyFields>(key: K) {
  if (shouldPreventActions.value) {
    setActiveSubjectAlert()
    emit('action-prevented')
    return
  }
  undoSubject(key)
}

function cleanupForm() {
  activeSubject.value = undefined
  activeNameRequest.value = undefined
  activeNt.value = undefined
}

async function onDone() {
  try {
    await formRef.value?.validate()

    // emit('done')
    editSubject(activeSubject.value)
    console.log('VALID')
    cleanupForm()
  } catch (e) {
    onFormSubmitError(e as FormErrorEvent)
  }
}
</script>

<template>
  <ConnectPageSection
    :heading="{
      label: $t('label.yourCompany'),
      icon: 'i-mdi-domain',
      ui: 'bg-shade-secondary px-4 py-4 sm:px-6 rounded-t-md'
    }"
    ui-body="p-0 sm:p-0"
  >
    <UForm
      ref="form-ref"
      :state="activeSubject"
      :schema
      :nested
      name="activeYourCompany"
      class="flex flex-col"
      @pointerdown="clearAllAlerts"
      @keydown="clearAllAlerts"
    >
      <ManageYourCompanyName
        v-model="activeSubject"
        :fields="state.new"
        :state-key
        :is-read-only-variant
        :nr-allowed-actions-types
        :correct-name-options
        :business
        @done="onDone"
        @cancel="cleanupForm"
        @init-edit="onInitEdit"
        @undo="onUndo"
      />

      <USeparator class="padding-x-default" />

      <!-- need to add to nt :labelOverrides :allowedActions -->
      <ManageYourCompanyNt
        v-model="activeNt"
        :state-key="stateKey + '-nt'"
        :variant
        :loading
        :preventActions
        :actionPreventedSignal
      />

      <USeparator class="padding-x-default" />

      <!-- Recognition Date - non-editable -->
      <ManageYourCompanyRecognitionDate
        :loading
        :founding-date="business?.foundingDate"
      />

      <USeparator class="padding-x-default" />

      <!-- Contact Info - non-editable -->
      <ManageYourCompanyContactInfo :contact :loading />
    </UForm>
  </ConnectPageSection>
</template>
