<script setup lang="ts">
const props = defineProps<{
  files?: CourtOrderFileUi[]
  isRemoved: boolean
}>()

const activeFiles = computed(() =>
  (props.files || []).filter(f => f.action !== CourtOrderFileAction.DELETED)
)
</script>

<template>
  <span v-if="!activeFiles.length" />

  <ul
    v-else
    :class="[
      'flex flex-col gap-1 min-w-48 max-w-48 overflow-clip list-none p-0 m-0',
      isRemoved ? 'opacity-40' : ''
    ]"
  >
    <li v-for="file in activeFiles" :key="file.id">
      <TableColumnDocumentsItem v-bind="file" :is-removed />
    </li>
  </ul>
</template>
