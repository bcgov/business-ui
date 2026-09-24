<script setup lang="ts">
// The current company name
const {
  stateKey,
  fieldState,
  loading,
  labelOverrides,
  isReadOnlyVariant
} = defineProps<{
  stateKey: string
  business?: BusinessData | BusinessDataPublic
  fieldState?: ManageYourCompanyFields['numberExpro']
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

const alertTarget = 'number-expro'
const { alerts, attachAlerts } = useFilingAlerts(stateKey)
const { targetId, messageId } = attachAlerts(alertTarget, model)
</script>

<template>
  <ConnectFieldset padding-class="padding-x-default py-4 sm:py-5">
    <template #label>
      <div class="space-y-1">
        <div>Extraprovincial Registration Number in B.C.</div>
        <ManageYourCompanyBadge :actions="fieldState?.actions" :label-overrides />
      </div>
    </template>
    <template #default>
      <USkeleton v-if="loading" class="h-8 w-3/4 sm:w-1/2" />

      <SubFormFieldWrapper
        v-else-if="model && model.key === 'numberExpro'"
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
          id="number-expro-input"
          v-model="model.value"
          label="Enter extraprovincial number"
          @keydown.enter.stop="$emit('done')"
        />
      </SubFormFieldWrapper>

      <div
        v-else-if="fieldState?.value"
        class="flex items-center justify-between -mt-4 sm:-mt-1.5"
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
