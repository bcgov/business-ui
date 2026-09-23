<script setup lang="ts">
const props = defineProps<{
  actions?: ActionType[]
  labelOverrides?: TableLabelOverrides
}>()

const emit = defineEmits<{
  'init-edit': []
  'undo': []
}>()

const { t } = useI18n()

const hasActions = computed(() => !!props.actions?.length)

const editLabel = computed(() => props.labelOverrides?.editLabel || t('label.change'))

const mainAction = computed(() => {
  if (hasActions.value) {
    return { label: t('label.undo'), icon: 'i-mdi-undo', onClick: () => emit('undo') }
  }
  return { label: editLabel.value, icon: 'i-mdi-pencil', onClick: () => emit('init-edit') }
})

const dropdownActions = computed(() => {
  if (hasActions.value) {
    return [{ label: editLabel.value, icon: 'i-mdi-pencil', onSelect: () => emit('init-edit') }]
  }
  return []
})
</script>

<template>
  <UFieldGroup class="divide-x divide-line-muted h-min">
    <UButton
      variant="ghost"
      v-bind="mainAction"
    />

    <UDropdownMenu
      v-if="dropdownActions.length"
      :items="dropdownActions"
      :content="{
        align: 'end'
      }"
    >
      <UButton
        variant="ghost"
        icon="i-mdi-caret-down"
        class="px-4 data-[state=open]:bg-(--ui-primary)/25 group"
        :aria-label="$t('label.moreActions')"
        :ui="{
          leadingIcon: 'shrink-0 group-data-[state=open]:rotate-180 transition-transform duration-200'
        }"
      />
    </UDropdownMenu>
  </UFieldGroup>
</template>