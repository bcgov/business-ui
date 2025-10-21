<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  dropdownItems?: DropdownMenuItem[]
  dropdownAttrs?: object
  dropdownButtonAttrs?: object
  wrapperAttrs?: object
}>()
</script>

<template>
  <div class="flex items-start" v-bind="wrapperAttrs">
    <!-- the main button -->
    <UButton
      v-bind="$attrs"
      class="px-3 py-2"
      variant="ghost"
    />
    <!-- the drop-down menu TBD -->
    <UDropdownMenu
      v-if="dropdownItems"
      :items="dropdownItems"
      :content="{
        align: 'start',
        side: 'bottom',
        sideOffset: 8
      }"
      v-bind="dropdownAttrs"
    >
      <UButton icon="i-mdi-chevron-down" v-bind="dropdownButtonAttrs" />
    </UDropdownMenu>
  </div>
</template>
