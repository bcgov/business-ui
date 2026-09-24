<script setup lang="ts">
// The company legalType also known as entity type or corp type
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

const emit = defineEmits<{
  'init-edit': ['legalType']
  'done': []
  'cancel': []
  'undo': ['legalType']
}>()

const model = defineModel<ActiveYourCompanySchema>()

const alertTarget = 'legal-type'
const { alerts, attachAlerts } = useFilingAlerts(stateKey)
const { targetId, messageId } = attachAlerts(alertTarget, model)

const displayValue = computed(() => fieldState?.value ? getCorpFullDescription(fieldState.value) : '')
</script>

<template>
  <ConnectFieldset
    class="py-4 sm:py-5"
    @keydown.enter.stop="$emit('done')"
  >
    <template #label>
      <div class="space-y-1">
        <div>Business Type</div>
        <ManageYourCompanyBadge :actions="fieldState?.actions" :label-overrides />
      </div>
    </template>
    <template #default>
      <USkeleton v-if="loading" class="h-6 w-2/3 sm:w-1/3" />

      <SubFormFieldWrapper
        v-else-if="model && model.key === 'legalType'"
        name="value"
        :task-guard-config="{
          message: alerts[alertTarget],
          messageId,
          targetId
        }"
        @done="$emit('done')"
        @cancel="$emit('cancel')"
      >
        <!-- TODO/FUTURE: configure options based on data resource, currently blocked by #35034 -->
        <ConnectSelect
          id="business-type-menu"
          v-model="model.value"
          label="Select Business Type"
          :items="[CorpTypeCd.BC_COMPANY, CorpTypeCd.BENEFIT_COMPANY, CorpTypeCd.BC_ULC_COMPANY]"
          required
          class="w-full"
        />
      </SubFormFieldWrapper>

      <div
        v-else-if="fieldState?.value"
        class="flex items-center justify-between -mt-4 sm:-mt-1.5"
      >
        <span>{{ displayValue }}</span>
        <ManageYourCompanyActions
          v-if="!isReadOnlyVariant"
          :actions="fieldState.actions"
          @init-edit="$emit('init-edit', 'legalType')"
          @undo="$emit('undo', 'legalType')"
        />
      </div>
    </template>
  </ConnectFieldset>
</template>
