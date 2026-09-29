<script setup lang="ts">
import type { BadgeProps } from '@nuxt/ui'

const {
  badgeOrientation = 'vertical'
} = defineProps<{
  label?: string
  badges: BadgeProps[]
  badgeOrientation?: 'vertical' | 'horizontal'
  labelClass?: string
  icon?: string
  iconClass?: string
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
      <div class="flex gap-2">
        <UIcon
          v-if="icon"
          :name="icon"
          class="size-5 shrink-0"
          :class="iconClass || 'text-neutral'"
          data-testid="identity-icon"
        />
        <slot>
          <div v-if="label" :class="labelClass">
            {{ label }}
          </div>
        </slot>
      </div>
      <slot name="additional-label" />
    </div>
    <!-- indent to line up with the label when there's an icon (size-5 + gap-2) -->
    <ul
      v-if="badges.length > 0"
      class="flex flex-col gap-2"
      :class="{ 'pl-7': icon }"
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
