<script setup lang="ts">
const helpDocs = inject('sbc-bar-help-docs')
</script>
<template>
  <ContentRenderer :value="helpDocs" class="prose prose-bcGov prose-h2:mt-4 prose-h2:mb-2 min-w-full max-w-[95vw] overflow-hidden break-words text-left leading-snug" />
</template>
