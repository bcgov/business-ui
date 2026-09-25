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

const jurisdictionOpts = getJurisdictionMenuItems()

const newJurisdictionDisplayValue = computed(() => getJurisdictionLabel(fields.newJurisdiction?.value))
const previousJurisdictionDisplayValue = computed(() => getJurisdictionLabel(fields.previousJurisdiction?.value))

// normalize jurisdiction to match InputMenuItem
const selectedJurisdiction = computed({
  get() {
    if (
      !model.value
      || !model.value.value
      || (model.value.key !== 'newJurisdiction' && model.value.key !== 'previousJurisdiction')
    ) {
      return undefined
    }

    const { country, region } = model.value.value
    if (!country) {
      return undefined
    }

    return {
      label: getJurisdictionLabel(model.value.value),
      country,
      region
    }
  },
  set(val: { label?: string, country: string, region: string | null } | undefined) {
    if (
      !model.value
      || (model.value.key !== 'newJurisdiction' && model.value.key !== 'previousJurisdiction')
    ) {
      return
    }

    model.value = {
      key: model.value.key,
      value: {
        country: val?.country ?? '',
        region: val?.region ?? null
      }
    }
  }
})
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
    <ConnectInputMenu
      id="new-jurisdiction-menu"
      v-model="selectedJurisdiction"
      :label="$t('label.selectNewJurisdiction')"
      :items="jurisdictionOpts"
      open-on-focus
      :ui="{
        label: 'font-bold px-4 pb-2 pt-3',
        separator: 'mx-0'
      }"
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
    <ConnectInputMenu
      id="previous-jurisdiction-menu"
      v-model="selectedJurisdiction"
      :label="$t('label.selectPreviousJurisdiction')"
      :items="jurisdictionOpts"
      open-on-focus
      :ui="{
        label: 'font-bold px-4 pb-2 pt-3',
        separator: 'mx-0'
      }"
    />
  </ManageYourCompanyFieldRow>
</template>
