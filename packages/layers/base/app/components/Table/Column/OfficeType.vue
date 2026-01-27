<script setup lang="ts">
import type { BadgeProps } from '@nuxt/ui'

defineProps<{
  type: OfficeType
  badges: BadgeProps[]
}>()
</script>

<template>
  <div>
    <span>{{ $t(`officeType.${type}`) }}</span>
    <ul v-if="badges.length > 0" class="flex flex-col gap-2">
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
