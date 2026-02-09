<script setup lang="ts">
import type { BadgeProps } from '@nuxt/ui'

defineProps<{
  label?: string
  badges: BadgeProps[]
  labelClass?: string
}>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <slot>
      <div v-if="label" :class="labelClass">
        {{ label }}
      </div>
    </slot>
    <ul
      v-if="badges.length > 0"
      class="flex flex-col gap-2"
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
