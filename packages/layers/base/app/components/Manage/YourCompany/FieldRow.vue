<script setup lang="ts">
const {
  stateKey,
  fieldKey,
  fieldState,
  label,
  subLabel,
  displayValue,
  loading = false,
  labelOverrides,
  isReadOnlyVariant = false,
  indent = false,
  paddingClass = 'padding-x-default pb-4 sm:pb-5'
} = defineProps<{
  stateKey: string
  fieldKey: keyof ManageYourCompanyFields
  fieldState?: ManageYourCompanyFieldState<any>
  label: string
  subLabel?: string
  displayValue?: string
  loading?: boolean
  labelOverrides?: TableLabelOverrides
  isReadOnlyVariant?: boolean
  indent?: boolean
  paddingClass?: string
}>()

const emit = defineEmits<{
  'init-edit': [key: keyof ManageYourCompanyFields]
  'done': []
  'cancel': []
  'undo': [key: keyof ManageYourCompanyFields]
}>()

const model = defineModel<ActiveYourCompanySchema>()

// Attach filing alerts for validation errors (e.g., cross-field task guards)
const { alerts, attachAlerts } = useFilingAlerts(stateKey)
const { targetId, messageId } = attachAlerts(fieldKey, model)

// Determines whether the current field has a value to render in view mode
const hasDisplayValue = computed(() => {
  if (displayValue !== undefined) {
    return Boolean(displayValue)
  }
  return fieldState?.value !== undefined && fieldState?.value !== null && fieldState?.value !== ''
})

// Whether this specific field is currently open in edit mode
const isEditing = computed(() => Boolean(model.value && model.value.key === fieldKey))
</script>

<template>
  <ConnectFieldset
    :padding-class="paddingClass"
    @keydown.enter.stop="$emit('done')"
  >
    <template #label>
      <div :class="['space-y-1', { 'ml-4': indent }]">
        <slot name="label">
          <div>{{ label }}</div>
          <div
            v-if="subLabel"
            class="font-normal text-sm italic"
          >
            ({{ subLabel }})
          </div>
        </slot>
        <ManageYourCompanyBadge
          :actions="fieldState?.actions"
          :label-overrides="labelOverrides"
          :class="{ 'mt-1': subLabel }"
        />
      </div>
    </template>

    <template #default>
      <!-- Loading Skeleton -->
      <USkeleton
        v-if="loading"
        class="h-6 w-2/3 sm:w-1/3"
      />

      <!-- Subform Edit Mode -->
      <SubFormFieldWrapper
        v-else-if="isEditing"
        name="value"
        :task-guard-config="{
          message: alerts[fieldKey],
          messageId,
          targetId
        }"
        @done="$emit('done')"
        @cancel="$emit('cancel')"
      >
        <slot :model="model" />
      </SubFormFieldWrapper>

      <!-- Read-Only View Mode -->
      <div
        v-else-if="hasDisplayValue"
        :class="['flex items-center justify-between -mt-4 sm:-mt-1.5', { 'ml-4 sm:ml-0': indent }]"
      >
        <slot name="display">
          <span>{{ displayValue ?? fieldState?.value }}</span>
        </slot>

        <ManageYourCompanyActions
          v-if="!isReadOnlyVariant"
          :actions="fieldState?.actions"
          @init-edit="$emit('init-edit', fieldKey)"
          @undo="$emit('undo', fieldKey)"
        />
      </div>
    </template>
  </ConnectFieldset>
</template>
