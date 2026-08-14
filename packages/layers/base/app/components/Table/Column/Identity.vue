<script setup lang="ts">
import type { BadgeProps } from '@nuxt/ui'

const {
  badgeOrientation = 'vertical'
} = defineProps<{
  label?: string
  badges: BadgeProps[]
  badgeOrientation?: 'vertical' | 'horizontal'
  labelClass?: string
}>()
</script>

<template>
  <div
    class="flex"
    :class="{
      'flex-col gap-1': badgeOrientation === 'vertical',
      'flex-row gap-2 items-center': badgeOrientation === 'horizontal'
    }"
  >
    <div class="flex flex-col gap-1">
      <slot>
        <div v-if="label" :class="labelClass">
          {{ label }}
        </div>
      </slot>
      <slot name="additional-label" />
    </div>
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
