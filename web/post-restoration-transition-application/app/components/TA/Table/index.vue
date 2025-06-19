<script setup lang="ts">
import type { TableColumn } from '#ui/components/Table.vue'

defineProps<{
  tableData: undefined[]
  columns: TableColumn<undefined, unknown>[] // for supported values see: https://ui.nuxt.com/components/table#columns
}>()
</script>

<template>
  <UTable
    :data="tableData"
    :columns

    sticky
    :ui="{
      root: 'bg-white rounded-sm ring ring-gray-200',
      tbody: 'px-10',
      th: 'bg-bcGovColor-gray2 px-2',
      td: 'px-0 py-0 text-bcGovGray-700 align-top',
    }"
  >
<!--    v-model:expanded="expanded"-->
<!--    :loading="initializing"-->
<!--    tr: expandedTrClass-->
    <template #empty>
      <div class="text-bcGovGray-700 text-left text-base px-6">
        {{ $t('text.noAddresses') }}
      </div>
    </template>
  </UTable>
</template>

<style scoped>

</style>
