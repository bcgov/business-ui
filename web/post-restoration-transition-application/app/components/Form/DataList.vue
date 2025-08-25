<script setup lang="ts">
</script>

<template>
  <UTable
    :ui="{
      base: 'min-w-full table-fixed',
      thead: 'relative border-0 [&>td]:border-0 [&>tr]:border-0',
      tbody: 'divide-y-0',
      tr: 'border-0',
      th: 'text-base text-left text-bcGovColor-midGray p-4',
      td: 'border-t-1 border-bcGovColor-hairlinesOnWhite text-base whitespace-nowrap p-4 text-gray-500'
    }"
  >
    <template #expanded="{ row }">
      <slot name="expanded" :row="row" />
    </template>
  </UTable>
</template>

<style scoped>
</style>
