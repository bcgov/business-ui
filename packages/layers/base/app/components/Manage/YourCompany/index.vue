<script setup lang="ts">
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
  labelOverrides,
  sectionOverrides
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
  preventActions: () => preventActions,
  actionPreventedSignal: () => actionPreventedSignal,
  activeSubjects: [
    ...fieldKeys.map(t => ({
      subject: activeSubject,
      alertTarget: t
    })),
    {
      subject: activeSubject,
      alertTarget: 'company-name-form'
    },
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

function getIsVisible(keys: Array<keyof NonNullable<ManageYourCompanyProps['sectionOverrides']>>): boolean {
  return keys.some(k => sectionOverrides?.[k] !== 'hide')
}

function getIsReadOnly(keys: Array<keyof NonNullable<ManageYourCompanyProps['sectionOverrides']>>): boolean {
  return isReadOnlyVariant.value || keys.some(k => sectionOverrides?.[k] === 'readonly')
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
      :class="[
        'flex flex-col',
        '[&>:not(:first-child)]:relative [&>:not(:first-child)]:before:absolute [&>:not(:first-child)]:before:right-0',
        '[&>:not(:first-child)]:before:top-0 [&>:not(:first-child)]:before:left-0',
        '[&>:not(:first-child)]:before:border-t [&>:not(:first-child)]:before:border-line-muted',
        '[&>:not(:first-child)]:before:mx-4 sm:[&>:not(:first-child)]:before:mx-7.5'
      ]"
      @pointerup="clearAllAlerts"
      @keyup="clearAllAlerts"
    >
      <!-- Current legal name & name in new and/or previous jurisdiction -->
      <ManageYourCompanySectionName
        v-if="getIsVisible(['nameRequest'])"
        v-model="activeSubject"
        :fields="state.new"
        :state-key
        :is-read-only-variant
        :nr-allowed-actions-types
        :correct-name-options
        :business
        :loading
        :label-overrides="tableLabels"
        :section-overrides
        @done="onDone"
        @cancel="cleanupForm"
        @init-edit="onInitEdit"
        @undo="onUndo"
      />

      <!-- Company name translations -->
      <ManageYourCompanySectionNameTranslations
        v-if="getIsVisible(['nameTranslations'])"
        v-model="activeNt"
        :state-key="stateKey + '-nt'"
        :variant
        :loading
        :prevent-actions
        :action-prevented-signal
        :allowed-actions="getIsReadOnly(['nameTranslations']) ? [] : ntAllowedActions"
        :label-overrides="tableLabels"
        @action-prevented="setActiveSubjectAlert"
      />

      <!-- Company Extraprovincial number and the identifying number in the previous jurisdiction -->
      <ManageYourCompanySectionExproNumber
        v-if="getIsVisible(['numberExpro'])"
        v-model="activeSubject"
        :fields="state.new"
        :state-key
        :is-read-only-variant
        :loading
        :label-overrides="tableLabels"
        :section-overrides
        @done="onDone"
        @cancel="cleanupForm"
        @init-edit="onInitEdit"
        @undo="onUndo"
      />

      <!-- Current legal type also known as entity type or corp type -->
      <ManageYourCompanySectionType
        v-if="getIsVisible(['legalType'])"
        v-model="activeSubject"
        :field-state="state.new.legalType"
        :state-key
        :is-read-only-variant="getIsReadOnly(['legalType'])"
        :loading
        :label-overrides="tableLabels"
        @done="onDone"
        @cancel="cleanupForm"
        @init-edit="onInitEdit"
        @undo="onUndo"
      />

      <!-- Recognition Date - non-editable -->
      <ManageYourCompanySectionRecognitionDate
        v-if="getIsVisible(['foundingDate'])"
        :loading
        :founding-date="business?.foundingDate"
      />

      <!-- Amalgamation Out or Continuation Out Date -->
      <ManageYourCompanySectionOutDate
        v-if="getIsVisible(['outDate'])"
        v-model="activeSubject"
        :field-state="state.new.outDate"
        :state-key
        :is-read-only-variant="getIsReadOnly(['outDate'])"
        :loading
        :corrected-filing-type
        :label-overrides="tableLabels"
        @done="onDone"
        @cancel="cleanupForm"
        @init-edit="onInitEdit"
        @undo="onUndo"
      />

      <!-- Current jurisdiction & new and/or previous jurisdiction -->
      <ManageYourCompanySectionJurisdiction
        v-if="getIsVisible(['jurisdiction', 'newJurisdiction', 'previousJurisdiction'])"
        v-model="activeSubject"
        :fields="state.new"
        :state-key
        :is-read-only-variant
        :loading
        :label-overrides="tableLabels"
        :section-overrides
        @done="onDone"
        @cancel="cleanupForm"
        @init-edit="onInitEdit"
        @undo="onUndo"
      />

      <!-- Contact Info - non-editable -->
      <ManageYourCompanySectionContactInfo
        v-if="getIsVisible(['contactInfo'])"
        :loading
        :contact
      />
    </UForm>
  </ConnectPageSection>
</template>
