<script setup lang="ts">
// The company legalType also known as entity type or corp type - may be changed by a name request
const {
  stateKey,
  fieldState,
  loading,
  labelOverrides
} = defineProps<{
  stateKey: string
  fieldState?: ManageYourCompanyFields['legalType']
  loading?: boolean
  labelOverrides?: TableLabelOverrides
  isReadOnlyVariant?: boolean
}>()

defineEmits<{
  'done': []
  'cancel': []
  'init-edit': [key: keyof ManageYourCompanyFields]
  'undo': [key: keyof ManageYourCompanyFields]
}>()

const model = defineModel<ActiveYourCompanySchema>()

const displayValue = computed(() => fieldState?.value ? getCorpFullDescription(fieldState.value) : '')
</script>

<template>
  <ManageYourCompanyFieldRow
    v-model="model"
    :state-key
    field-key="legalType"
    :field-state
    :label="$t('label.businessType')"
    :loading
    :label-overrides
    :is-read-only-variant
    :display-value
    padding-class="py-4 sm:py-5 padding-x-default"
    @init-edit="$emit('init-edit', $event)"
    @undo="$emit('undo', $event)"
    @done="$emit('done')"
    @cancel="$emit('cancel')"
  >
    <ConnectSelect
      v-if="model"
      id="business-type-menu"
      v-model="model.value"
      :label="$t('label.selectBusinessType')"
      :items="[CorpTypeCd.BC_COMPANY, CorpTypeCd.BENEFIT_COMPANY, CorpTypeCd.BC_ULC_COMPANY]"
      required
      class="w-full"
    />
  </ManageYourCompanyFieldRow>
</template>
