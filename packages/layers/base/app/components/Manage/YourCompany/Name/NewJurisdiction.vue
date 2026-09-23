<script setup lang="ts">
// The legal company name in the new jurisdiction after an Amalgamation Out or Continuation Out filing
const {
  stateKey,
  fieldState,
  loading,
  labelOverrides
} = defineProps<{
  stateKey: string
  fieldState?: ManageYourCompanyFields['nameNewJurisdiction']
  loading?: boolean
  labelOverrides?: TableLabelOverrides
  isReadOnlyVariant?: boolean
}>()

const emit = defineEmits<{
  'init-edit': []
  'done': []
  'cancel': []
  'undo': []
}>()

const model = defineModel<ActiveYourCompanySchema>()

const alertTarget = 'new-juridiction-name'
const { alerts, attachAlerts } = useFilingAlerts(stateKey)
const { targetId, messageId } = attachAlerts(alertTarget, model)
</script>

<template>
  <ConnectFieldset>
    <template #label>
      <div class="ml-4 space-y-1">
        <div>Name in new Jurisdiction</div>
        <ManageYourCompanyBadge :actions="fieldState?.actions" :label-overrides />
      </div>
    </template>
    <template #default>
      <USkeleton v-if="loading" class="h-6 w-2/3 sm:w-1/3" />

      <SubFormFieldWrapper
        v-else-if="model && model.key === 'nameNewJurisdiction'"
        name="value"
        :task-guard-config="{
          message: alerts[alertTarget],
          messageId,
          targetId
        }"
        @done="$emit('done')"
        @cancel="$emit('cancel')"
      >
        <ConnectInput
          id="new-juridiction-name"
          v-model="model.value"
          label="Enter name in new jurisdiction"
          @keydown.enter.stop="$emit('done')"
        />
      </SubFormFieldWrapper>

      <div
        v-else-if="fieldState?.value"
        class="flex items-center justify-between -mt-4 sm:-mt-1.5 ml-4 sm:ml-0"
      >
        <span>{{ fieldState.value }}</span>
        <ManageYourCompanyActions
          v-if="!isReadOnlyVariant"
          :actions="fieldState.actions"
          @init-edit="$emit('init-edit')"
          @undo="$emit('undo')"
        />
      </div>
    </template>
  </ConnectFieldset>
</template>
