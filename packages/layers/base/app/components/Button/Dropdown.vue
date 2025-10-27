<script setup lang="ts">
import type { ButtonProps, DropdownMenuItem, DropdownMenuProps } from '@nuxt/ui'

defineProps<{
  buttonAttrs?: ButtonProps
  dropdownItems?: DropdownMenuItem[]
  dropdownAttrs?: DropdownMenuProps
  dropdownButtonAttrs?: ButtonProps
  hideSeparator?: boolean
}>()
</script>

<template>
  <div class="flex items-start divide-x divide-line-muted *:px-3">
    <!-- the main button -->
    <UButton
      v-bind="buttonAttrs"
      :class="!hideSeparator && dropdownItems ? 'rounded-r-none' : 'border-none'"
      variant="ghost"
    />
    <UDropdownMenu
      v-if="dropdownItems"
      :items="dropdownItems"
      :content="{
        align: 'end',
        side: 'bottom',
        sideOffset: 8
      }"
      :ui="{ item: 'text-primary' }"
      v-bind="dropdownAttrs"
    >
      <UButton
        :class="{ 'rounded-l-none': !hideSeparator }"
        icon="i-mdi-chevron-down"
        variant="ghost"
        v-bind="dropdownButtonAttrs"
      />
    </UDropdownMenu>
  </div>
</template>
