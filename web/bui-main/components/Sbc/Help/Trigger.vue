<script setup lang="ts">
const helpModal = useHelpModal()
const localePath = useLocalePath()
</script>
<template>
  <!-- open modal on touch screen, open new tab on desktop -->
  <!-- hide modal trigger on desktop -->
  <UButton
    class="[@media(pointer:fine)]:hidden"
    variant="outline"
    :label="$t('btn.openHelpDocs')"
    icon="i-mdi-help-circle-outline"
    trailing
    size="sm"
    @click="helpModal.open()"
  />
  <!-- hide link on touch screen -->
  <UButton
    class="[@media(pointer:coarse)]:hidden"
    variant="outline"
    :label="$t('btn.openHelpDocs')"
    icon="i-mdi-help-circle-outline"
    trailing
    size="sm"
    target="_blank"
    :to="localePath('/help')"
  />
</template>
