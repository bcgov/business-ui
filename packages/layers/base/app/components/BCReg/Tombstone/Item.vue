<script setup lang="ts">
import type { BusinessTombstoneItem } from '#imports'

defineProps<BusinessTombstoneItem>()
</script>

<template>
  <div class="flex space-x-1">
    <UIcon
      v-if="icon"
      v-bind="icon"
      :class="itemClass || 'mt-1 text-primary'"
    />
    <UBadge
      v-if="badge"
      v-bind="badge"
      :class="itemClass || 'px-3'"
    />
    <ULink
      v-else-if="link"
      v-bind="link"
      :class="itemClass || 'mt-[2px] text-sm text-primary underline'"
    />
    <p
      v-else
      :class="itemClass || 'mt-[2px] text-sm'"
    >
      {{ text }}
    </p>
  </div>
</template>
