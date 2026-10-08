<script setup lang="ts">
// The legal company name in the new jurisdiction after an Amalgamation Out or Continuation Out filing
const {
  stateKey,
  fields,
  loading,
  labelOverrides,
  isReadOnlyVariant
} = defineProps<{
  stateKey: string
  fields: ManageYourCompanyFields
  loading?: boolean
  labelOverrides?: TableLabelOverrides
  isReadOnlyVariant?: boolean
}>()

defineEmits<{
  'done': []
  'init-edit': [key: keyof ManageYourCompanyFields]
  'undo': [key: keyof ManageYourCompanyFields]
  'cancel': []
}>()

const model = defineModel<ActiveYourCompanySchema>()

const newJurisdictionDisplayValue = computed(() => getJurisdictionLabel(fields.newJurisdiction?.value))
const previousJurisdictionDisplayValue = computed(() => getJurisdictionLabel(fields.previousJurisdiction?.value))

// bridges the active discriminated-union member's value to the jurisdiction field
function jurisdictionValueModel(key: 'newJurisdiction' | 'previousJurisdiction') {
  return computed({
    get(): { country: string, region?: string | null } | undefined {
      if (!model.value || model.value.key !== key) {
        return undefined
      }
      return model.value.value
    },
    set(val: { country: string, region?: string | null } | undefined) {
      if (!model.value || model.value.key !== key) {
        return
      }
      model.value = {
        key,
        value: {
          country: val?.country ?? '',
          region: val?.region ?? null
        }
      }
    }
  })
}

const newJurisdictionValue = jurisdictionValueModel('newJurisdiction')
const previousJurisdictionValue = jurisdictionValueModel('previousJurisdiction')
</script>

<template>
  <ConnectFormFieldWrapper
    padding-class="py-4 sm:py-5 padding-x-default"
    :label="$t('label.jurisdiction')"
  >
    <div class="-mt-2 sm:mt-0">
      {{ $t('label.britishColumbia') }}
    </div>
  </ConnectFormFieldWrapper>

  <!-- The new jurisdiction after an Amalgamation Out or Continuation Out filing -->
  <ManageYourCompanyFieldRow
    v-model="model"
    :state-key
    field-key="newJurisdiction"
    :field-state="fields.newJurisdiction"
    :label="$t('label.newJurisdiction')"
    :display-value="newJurisdictionDisplayValue"
    :loading
    :label-overrides
    :is-read-only-variant
    indent
    @init-edit="$emit('init-edit', $event)"
    @undo="$emit('undo', $event)"
    @done="$emit('done')"
    @cancel="$emit('cancel')"
  >
    <FormForeignJurisdictionField
      v-if="model && model.key === 'newJurisdiction'"
      id="new-jurisdiction-menu"
      v-model="newJurisdictionValue"
      name="value.country"
    />
  </ManageYourCompanyFieldRow>

  <!-- The previous jurisdiction after a Continuation In filing -->
  <ManageYourCompanyFieldRow
    v-model="model"
    :state-key
    field-key="previousJurisdiction"
    :field-state="fields.previousJurisdiction"
    :label="$t('label.previousJurisdiction')"
    :display-value="previousJurisdictionDisplayValue"
    :loading
    :label-overrides
    :is-read-only-variant
    indent
    @init-edit="$emit('init-edit', $event)"
    @undo="$emit('undo', $event)"
    @done="$emit('done')"
    @cancel="$emit('cancel')"
  >
    <FormForeignJurisdictionField
      v-if="model && model.key === 'previousJurisdiction'"
      id="previous-jurisdiction-menu"
      v-model="previousJurisdictionValue"
      :select-label="$t('label.selectPreviousJurisdiction')"
      name="value.country"
    />
  </ManageYourCompanyFieldRow>
</template>
