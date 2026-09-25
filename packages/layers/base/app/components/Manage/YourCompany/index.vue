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
  nested = true,
  labelOverrides
} = defineProps<ManageCompanyNameProps & {
  preventActions?: boolean
  actionPreventedSignal?: number
  businessExtended?: BusinessDataExtended
  nested?: boolean
  correctedFilingType?: FilingType
  labelOverrides?: TableLabelOverrides
}>()

const emit = defineEmits<{
  'action-prevented': []
}>()

const activeSubject = defineModel<ActiveYourCompanySchema>('active-subject')
const activeNt = defineModel<ActiveNameTranslationSchema | undefined>('active-nt')

const formRef = useTemplateRef<Form<ActiveYourCompanySchema>>('form-ref')

const alertTargets = [
  'number-expro',
  'number-prev-jurisdiction',
  'new-jurisdiction',
  'previous-jurisdiction',
  'company-name-form',
  'new-jurisdiction-name',
  'previous-jurisdiction-name',
  'legal-type',
  'out-date'
]

const {
  state,
  editSubject,
  undoSubject
} = useManageYourCompany(stateKey, {
  cleanupFn: cleanupForm
})

const schema = getActiveYourCompanySchema()

const {
  isReadOnlyVariant,
  shouldPreventActions,
  tableAllowedActions: ntAllowedActions,
  tableLabels,
  setActiveSubjectAlert,
  clearAllAlerts
} = useManageCommon({
  stateKey,
  variant,
  allowedActions: nameTranslationAllowedActions,
  labelOverrides,
  preventActions,
  actionPreventedSignal,
  activeSubjects: [
    ...alertTargets.map(t => ({
      subject: activeSubject,
      alertTarget: t
    })),
    {
      subject: activeNt,
      alertTarget: 'name-translation-form'
    }
  ]
})

function onInitEdit<K extends keyof ManageYourCompanyFields>(key: K) {
  if (shouldPreventActions.value) {
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
      <!-- Current legal name & name in new and/or previous jurisdiction -->
      <ManageYourCompanyName
        v-model="activeSubject"
        :fields="state.new"
        :state-key
        :is-read-only-variant
        :nr-allowed-actions-types
        :correct-name-options
        :business
        :loading
        :label-overrides="tableLabels"
        @done="onDone"
        @cancel="cleanupForm"
        @init-edit="onInitEdit"
        @undo="onUndo"
      />

      <USeparator class="padding-x-default" />

      <!-- need to add to nt :labelOverrides :allowedActions -->
      <ManageYourCompanyNameTranslations
        v-model="activeNt"
        :state-key="stateKey + '-nt'"
        :variant
        :loading
        :prevent-actions
        :action-prevented-signal
        :allowed-actions="ntAllowedActions"
        :label-overrides="tableLabels"
        @action-prevented="setActiveSubjectAlert"
      />

      <USeparator class="padding-x-default" />

      <ManageYourCompanyExproNumber
        v-model="activeSubject"
        :fields="state.new"
        :state-key
        :is-read-only-variant
        :loading
        :previous-jurisdiction="state.new.previousJurisdiction?.value"
        :label-overrides="tableLabels"
        @done="onDone"
        @cancel="cleanupForm"
        @init-edit="onInitEdit"
        @undo="onUndo"
      />

      <USeparator class="padding-x-default" />

      <!-- Current legal type also known as entity type or corp type -->
      <ManageYourCompanyType
        v-model="activeSubject"
        :field-state="state.new.legalType"
        :state-key
        :is-read-only-variant
        :loading
        :label-overrides="tableLabels"
        @done="onDone"
        @cancel="cleanupForm"
        @init-edit="onInitEdit"
        @undo="onUndo"
      />

      <USeparator class="padding-x-default" />

      <!-- Recognition Date - non-editable -->
      <ManageYourCompanyRecognitionDate
        :loading
        :founding-date="business?.foundingDate"
      />

      <USeparator class="padding-x-default" />

      <!-- Amalgamation Out or Continuation Out Date -->
      <ManageYourCompanyOutDate
        v-model="activeSubject"
        :field-state="state.new.outDate"
        :state-key
        :is-read-only-variant
        :loading
        :corrected-filing-type
        :label-overrides="tableLabels"
        @done="onDone"
        @cancel="cleanupForm"
        @init-edit="onInitEdit"
        @undo="onUndo"
      />

      <USeparator class="padding-x-default" />

      <!-- Current jurisdiction & new and/or previous jurisdiction -->
      <ManageYourCompanyJurisdiction
        v-model="activeSubject"
        :fields="state.new"
        :state-key
        :is-read-only-variant
        :loading
        :label-overrides="tableLabels"
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
