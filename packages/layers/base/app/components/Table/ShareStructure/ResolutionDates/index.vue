<script setup lang="ts" generic="T extends ResolutionDateSchema = ResolutionDateSchema">
import type { ExpandedState } from '@tanstack/vue-table'

const props = defineProps<{
  data?: TableBusinessState<T>[]
  loading?: boolean
  allowedActions?: ManageAllowedAction[]
  preventActions?: boolean
  labelOverrides?: TableLabelOverrides
  hideActionsWhen?: (row: TableBusinessRow<T>) => boolean
}>()

const columns = getResolutionDatesTableColumns<T>(props.labelOverrides?.badges)
const expanded = defineModel<ExpandedState | undefined>('expanded')
const showAll = ref(false)

const displayedData = computed(() => {
  if (showAll.value) {
    return props.data
  }
  return props.data?.slice(0, 6)
})

defineOptions({
  inheritAttrs: false
})
</script>

<template>
  <div class="space-y-4">
    <TableBusiness
      v-bind="$attrs"
      v-model:expanded="expanded"
      :data="displayedData"
      :loading
      :columns
      :allowed-actions="allowedActions"
      :prevent-actions="preventActions"
      :label-overrides="labelOverrides"
      :get-row-id="(row: TableBusinessState<T>) => row.new.id"
      :hide-actions-when
      hide-table-header
      hide-empty-text
      tr-divider-full-width
    >
      <template #expanded="{ row }">
        <div class="py-4 sm:py-7.5">
          <slot name="expanded" :row />
        </div>
      </template>
    </TableBusiness>
    <div v-if="data && data.length > 6" class="space-y-4">
      <USeparator />
      <UButton
        :label="showAll ? $t('label.showLess') : $t('label.showAll')"
        variant="link"
        class="w-min underline p-0"
        @click="() => { showAll = !showAll }"
      />
    </div>
  </div>
</template>
