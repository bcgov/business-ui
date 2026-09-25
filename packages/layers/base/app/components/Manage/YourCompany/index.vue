<script setup lang="ts">
import { cloneDeep } from 'es-toolkit'
import type { Form, FormErrorEvent } from '@nuxt/ui'
import type { ManageYourCompanyProps } from '#business/app/interfaces'

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
} = defineProps<ManageYourCompanyProps>()

const emit = defineEmits<{
  'action-prevented': []
}>()

const activeSubject = defineModel<ActiveYourCompanySchema>('active-subject')
const activeNt = defineModel<ActiveNameTranslationSchema | undefined>('active-nt')

const formRef = useTemplateRef<Form<ActiveYourCompanySchema>>('form-ref')

const schema = getActiveYourCompanySchema()
const fieldKeys = schema.unwrap().options.map(o => o.shape.key.value)

const {
  state,
  editSubject,
  undoSubject
} = useManageYourCompany(stateKey, {
  cleanupFn: cleanupForm
})

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
    ...fieldKeys.map(t => ({
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

  const subject = state.value.new[key]

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
      @pointerup="clearAllAlerts"
      @keyup="clearAllAlerts"
    >
      <!-- Current legal name & name in new and/or previous jurisdiction -->
      <ManageYourCompanySectionName
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

      <!-- Company name translations -->
      <ManageYourCompanySectionNameTranslations
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

      <!-- Company Extraprovincial number and the identifying number in the previous jurisdiction -->
      <ManageYourCompanySectionExproNumber
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

      <!-- Current legal type also known as entity type or corp type -->
      <ManageYourCompanySectionType
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
      <ManageYourCompanySectionRecognitionDate
        :loading
        :founding-date="business?.foundingDate"
      />

      <USeparator class="padding-x-default" />

      <!-- Amalgamation Out or Continuation Out Date -->
      <ManageYourCompanySectionOutDate
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
      <ManageYourCompanySectionJurisdiction
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
      <ManageYourCompanySectionContactInfo
        :loading
        :contact
      />
    </UForm>
  </ConnectPageSection>
</template>
