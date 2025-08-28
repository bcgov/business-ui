<script setup lang="ts">
import type { ConnectDetailHeaderItem } from '#imports'

defineProps<ConnectDetailHeaderItem>()
</script>

<template>
  <div class="flex space-x-1">
    <UIcon
      v-if="icon"
      :name="icon"
      :class="iconClass || 'mt-1 text-primary'"
    />
    <UBadge
      v-if="badge"
      :label="text"
      :color="badgeColour || 'primary'"
      :class="itemClass || 'px-3'"
    />
    <a
      v-else-if="link"
      :href="linkHref"
      :class="itemClass || 'mt-[2px] text-sm text-primary underline'"
    >
      {{ text }}
    </a>
    <p
      v-else
      :class="itemClass || 'mt-[2px] text-sm'"
    >
      {{ text }}
    </p>
  </div>
</template>
