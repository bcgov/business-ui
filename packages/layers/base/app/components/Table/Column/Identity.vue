<script setup lang="ts">
import type { BadgeProps } from '@nuxt/ui'

defineProps<{
  label?: string
  badges: BadgeProps[]
}>()
</script>

<template>
  <div>
    <slot>
      <span v-if="label">{{ label }}</span>
    </slot>
    <ul
      v-if="badges.length > 0"
      class="flex flex-col gap-2"
      :class="label ? 'mt-1' : ''"
    >
      <UBadge
        v-for="badge in badges"
        :key="badge.label"
        v-bind="badge"
        class="w-min"
        as="li"
      />
    </ul>
  </div>
</template>
