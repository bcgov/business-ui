<script setup lang="ts">
import { cloneDeep } from 'es-toolkit'
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
} = defineProps<ManageCompanyNameProps & {
  preventActions?: boolean
  actionPreventedSignal?: number
  businessExtended?: BusinessDataExtended
  nested?: boolean
  correctedFilingType?: FilingType
}>()

const emit = defineEmits<{
  'action-prevented': []
}>()

const activeSubject = defineModel<ActiveYourCompanySchema>('active-subject')
const activeNameRequest = defineModel<ActiveNameRequestSchema | undefined>('active-name-request')
const activeNt = defineModel<ActiveNameTranslationSchema | undefined>('active-nt')

const formRef = useTemplateRef<Form<ActiveYourCompanySchema>>('form-ref')

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
    },
    {
      subject: activeSubject,
      alertTarget: 'out-date'
    },
    {
      subject: activeSubject,
      alertTarget: 'new-jurisdiction'
    }
  ]
})

function onInitEdit<K extends keyof ManageYourCompanyFields>(key: K) {
  console.log('init edit: ', key)
  if (shouldPreventActions.value) {
    console.log('preventing actions')
    setActiveSubjectAlert()
    emit('action-prevented')
    return
  }

  const subject = state.value.new[key] as ManageYourCompanyFieldState<any> | undefined

  if (!subject) {
    console.log('no subject found')
    return
  }

  console.log('subject: ', subject)

  activeSubject.value = {
    key,
    value: cloneDeep(subject.value)
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
  formRef.value?.clear()
  activeSubject.value = undefined
  activeNameRequest.value = undefined
  activeNt.value = undefined
}

async function onDone() {
  try {
    await formRef.value?.validate()
    editSubject(activeSubject.value)
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
        :loading
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
        :prevent-actions
        :action-prevented-signal
      />

      <USeparator class="padding-x-default" />

      <!-- Recognition Date - non-editable -->
      <ManageYourCompanyRecognitionDate
        :loading
        :founding-date="business?.foundingDate"
      />

      <USeparator class="padding-x-default" />

      <!-- Recognition Date - non-editable -->
      <ManageYourCompanyOutDate
        v-model="activeSubject"
        :field-state="state.new.outDate"
        :state-key
        :is-read-only-variant
        :loading
        :corrected-filing-type
        @done="onDone"
        @cancel="cleanupForm"
        @init-edit="onInitEdit"
        @undo="onUndo"
      />

      <USeparator class="padding-x-default" />

      <ManageYourCompanyJurisdiction
        v-model="activeSubject"
        :fields="state.new"
        :state-key
        :is-read-only-variant
        :loading
        @done="onDone"
        @cancel="cleanupForm"
        @init-edit="onInitEdit"
        @undo="onUndo"
      />

      <USeparator class="padding-x-default" />

      <!-- Contact Info - non-editable -->
      <ManageYourCompanyContactInfo
        :loading
        :contact
      />
    </UForm>
  </ConnectPageSection>
</template>
