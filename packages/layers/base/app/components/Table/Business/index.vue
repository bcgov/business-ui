<script setup lang="ts" generic="T extends { actions: ActionType[], isEditing: boolean }">
import type { ExpandedState } from '@tanstack/vue-table'
import type { DropdownMenuItem } from '@nuxt/ui'

const props = defineProps<{
  data?: TableBusinessState<T>[]
  columns: TableBusinessColumn<T>[]
  loading?: boolean
  emptyText?: string
  hideEmptyText?: boolean
  hideTableHeader?: boolean
  trDividerFullWidth?: boolean
  allowedActions?: ManageAllowedAction[]
  preventActions?: boolean
  labelOverrides?: TableLabelOverrides
  taskGuardConfig?: {
    message?: string
    messageId: string
    targetId: string
  }
  getCustomDropdownItems?: (row: TableBusinessRow<T>) => DropdownMenuItem[]
  hideActionsWhen?: (row: TableBusinessRow<T>) => boolean
}>()

defineEmits<{
  'init-edit': [row: TableBusinessRow<T>]
  'undo': [row: TableBusinessRow<T>]
  'remove': [row: TableBusinessRow<T>]
  'action-prevented': []
}>()

const expanded = defineModel<ExpandedState | undefined>('expanded', { required: true })

const showBodyTopSlot = computed(() => {
  if (!props.data || props.data.length === 0 || props.loading) {
    return false
  }
  return props.data.filter(i => !i.new.actions.includes(ActionType.REMOVED)).length === 0
})

const tableUi = computed(() => {
  const tbody = [
    'divide-y-0',
    props.taskGuardConfig?.message && 'shadow-section-error'
  ].filter(Boolean).join(' ')

  const thead = [
    props.taskGuardConfig?.message && 'shadow-section-error',
    props.hideTableHeader && 'sr-only'
  ].filter(Boolean).join(' ')

  const tr = [
    '[&:has([data-is-editing="true"])]:hidden',
    /* eslint-disable-next-line max-len */
    "relative after:absolute after:content-[''] after:bottom-0 after:h-px after:bg-gray-200 last:after:hidden data-[expanded=true]:after:hidden",
    props.trDividerFullWidth
      ? 'after:left-0 after:right-0'
      : 'after:left-6 after:right-6'
  ].join(' ')

  return {
    root: 'bg-white rounded-sm',
    tbody,
    th: 'text-neutral-highlighted px-2 bg-white',
    thead,
    td: 'text-neutral-highlighted align-top text-sm whitespace-normal p-0',
    tr
  }
})
</script>

<template>
  <UTable
    v-model:expanded="expanded"
    :data
    :loading
    :columns
    sticky
    :ui="tableUi"
  >
    <template #actions-cell="{ row }">
      <div
        v-if="row.original.new.isEditing"
        data-is-editing="true"
        class="hidden"
      />
      <TableColumnActions
        v-if="(row.depth === 0 || !getIsRowRemoved(row.getParentRow())) && !hideActionsWhen?.(row)"
        :row
        :allowed-actions="allowedActions"
        :prevent-actions="preventActions"
        :label-overrides="labelOverrides"
        :get-custom-dropdown-items="getCustomDropdownItems"
        @init-edit="$emit('init-edit', row)"
        @undo="$emit('undo', row)"
        @remove="$emit('remove', row)"
        @action-prevented="$emit('action-prevented')"
      />
    </template>

    <template #expanded="{ row }">
      <slot name="expanded" :row />
    </template>

    <template #empty>
      <div class="text-left text-base px-6">
        <FormAlertMessage
          v-if="taskGuardConfig && taskGuardConfig.message"
          :id="taskGuardConfig.messageId"
          :message="taskGuardConfig.message"
        />
        <span v-else-if="loading" class="text-neutral">{{ `${$t('label.loading')}...` }}</span>
        <span v-else class="text-neutral">{{ emptyText ?? $t('text.noDataToDisplay') }}</span>
      </div>
    </template>

    <template v-if="showBodyTopSlot" #body-top>
      <tr
        :class="!(props.hideEmptyText && props.hideTableHeader)
          && [
            `relative after:absolute after:content-['']`,
            'after:bottom-0 after:left-6 after:right-6 after:h-px after:bg-gray-200'
          ]
        "
      >
        <td :colspan="columns.length">
          <div
            v-if="(taskGuardConfig && taskGuardConfig.message) || !hideEmptyText"
            class="text-left text-base p-6"
          >
            <FormAlertMessage
              v-if="taskGuardConfig && taskGuardConfig.message"
              :id="taskGuardConfig.messageId"
              :message="taskGuardConfig.message"
            />
            <span v-else-if="!hideEmptyText" class="text-neutral">{{ emptyText ?? $t('text.noDataToDisplay') }}</span>
          </div>
        </td>
      </tr>
    </template>
  </UTable>
</template>
