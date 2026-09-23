<script setup lang="ts">
const {
  actions = [],
  labelOverrides
} = defineProps<{
  actions?: ActionType[]
  labelOverrides?: TableLabelOverrides
}>()

// getTableBadges returns an array of badges, we only need the first one
const badge = computed(() => getTableBadges(
  // @ts-expect-error - first arg is typed as a tanstack table row
  { original: { new: { actions: actions  } }},
  labelOverrides
)[0])
</script>

<template>
  <UBadge
    v-if="badge"
    v-bind="badge"
  />
</template>