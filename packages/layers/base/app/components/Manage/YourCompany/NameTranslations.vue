<script setup lang="ts">
const {
  stateKey,
  variant,
  labelOverrides,
  preventActions,
  actionPreventedSignal,
  allowedActions
} = defineProps<{
  stateKey: string
  variant: 'default' | 'correct' | 'readonly' | 'correct-readonly'
  loading?: boolean
  labelOverrides?: TableLabelOverrides
  preventActions?: boolean
  actionPreventedSignal?: number
  allowedActions?: ManageAllowedAction[]
}>()

defineEmits<{
  'action-prevented': []
}>()

const model = defineModel<ActiveNameTranslationSchema | undefined>()

const isReadOnlyVariant = computed(() => variant.includes('readonly'))
</script>

<template>
  <ConnectFieldset padding-class="padding-x-default py-4 sm:py-5">
    <template #label>
      <span>{{ $t('label.nameTranslations') }}</span>
    </template>
    <template #default>
      <div class="flex flex-col flex-1 gap-4">
        <span v-if="!isReadOnlyVariant">{{ $t('text.addNameTranslation') }}</span>
        <ManageNameTranslations
          v-model:active-name-translation="model"
          :state-key
          :loading
          :variant
          :allowed-actions
          :label-overrides
          :prevent-actions
          :action-prevented-signal
          @action-prevented="$emit('action-prevented')"
        />
      </div>
    </template>
  </ConnectFieldset>
</template>
