<script setup lang="ts">
import type { TableColumn } from '#ui/components/Table.vue'

// defineProps<{
//   data: undefined[]
//   columns: TableColumn<undefined, unknown>[] // for supported values see: https://ui.nuxt.com/components/table#columns
// }>()
</script>

<template>
  <UTable
    :ui="{
      base: 'min-w-full table-fixed',
      thead: 'relative border-0 [&>td]:border-0 [&>tr]:border-0',
      tbody: 'divide-y-0',
      tr: 'border-0',
      th: 'text-base text-left text-bcGovColor-midGray p-4',
      td: 'border-t-1 border-bcGovColor-hairlinesOnWhite text-base whitespace-nowrap p-4 text-gray-500 dark:text-gray-400'
    }"
  >
    <!-- todo: add slot for expanded -->
    <!-- todo: add slot for empty -->
  </UTable>
</template>

<style scoped>

</style>
