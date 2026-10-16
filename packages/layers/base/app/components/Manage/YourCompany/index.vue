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
  fieldOverrides
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

const { getIsVisible, getIsReadOnly } = useManageYourCompanyFieldOverrides(
  () => fieldOverrides,
  isReadOnlyVariant
)

const isVisible = computed(() => ({
  nameRequest: getIsVisible('nameRequest'),
  nameTranslations: getIsVisible('nameTranslations'),
  numberExpro: getIsVisible('numberExpro'),
  legalType: getIsVisible('legalType'),
  foundingDate: getIsVisible('foundingDate'),
  outDate: getIsVisible('outDate'),
  jurisdiction: getIsVisible(['jurisdiction', 'newJurisdiction', 'previousJurisdiction']),
  contactInfo: getIsVisible('contactInfo')
}))

const isReadonly = computed(() => ({
  nameTranslations: getIsReadOnly('nameTranslations'),
  numberExpro: getIsReadOnly('numberExpro'),
  legalType: getIsReadOnly('legalType'),
  outDate: getIsReadOnly('outDate')
}))
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
        v-if="isVisible.nameRequest"
        v-model="activeSubject"
        :fields="state.new"
        :state-key
        :is-read-only-variant
        :nr-allowed-actions-types
        :correct-name-options
        :business
        :loading
        :label-overrides="tableLabels"
        :field-overrides
        @done="onDone"
        @cancel="cleanupForm"
        @init-edit="onInitEdit"
        @undo="onUndo"
      />

      <!-- Company name translations -->
      <ManageYourCompanySectionNameTranslations
        v-if="isVisible.nameTranslations"
        v-model="activeNt"
        :state-key="stateKey + '-nt'"
        :variant
        :loading
        :prevent-actions
        :action-prevented-signal
        :allowed-actions="isReadonly.nameTranslations ? [] : ntAllowedActions"
        :label-overrides="tableLabels"
        @action-prevented="setActiveSubjectAlert"
      />

      <!-- Company Extraprovincial number and the identifying number in the previous jurisdiction -->
      <ManageYourCompanySectionExproNumber
        v-if="isVisible.numberExpro"
        v-model="activeSubject"
        :fields="state.new"
        :state-key
        :is-read-only-variant
        :loading
        :label-overrides="tableLabels"
        :field-overrides
        @done="onDone"
        @cancel="cleanupForm"
        @init-edit="onInitEdit"
        @undo="onUndo"
      />

      <!-- Current legal type also known as entity type or corp type -->
      <ManageYourCompanySectionType
        v-if="isVisible.legalType"
        v-model="activeSubject"
        :field-state="state.new.legalType"
        :state-key
        :is-read-only-variant="isReadonly.legalType"
        :loading
        :label-overrides="tableLabels"
        @done="onDone"
        @cancel="cleanupForm"
        @init-edit="onInitEdit"
        @undo="onUndo"
      />

      <!-- Recognition Date - non-editable -->
      <ManageYourCompanySectionRecognitionDate
        v-if="isVisible.foundingDate"
        :loading
        :founding-date="business?.foundingDate"
      />

      <!-- Amalgamation Out or Continuation Out Date -->
      <ManageYourCompanySectionOutDate
        v-if="isVisible.outDate"
        v-model="activeSubject"
        :field-state="state.new.outDate"
        :state-key
        :is-read-only-variant="isReadonly.outDate"
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
        v-if="isVisible.jurisdiction"
        v-model="activeSubject"
        :fields="state.new"
        :state-key
        :is-read-only-variant
        :loading
        :label-overrides="tableLabels"
        :field-overrides
        @done="onDone"
        @cancel="cleanupForm"
        @init-edit="onInitEdit"
        @undo="onUndo"
      />

      <!-- Contact Info - non-editable -->
      <ManageYourCompanySectionContactInfo
        v-if="isVisible.contactInfo"
        :loading
        :contact
      />
    </UForm>
  </ConnectPageSection>
</template>
