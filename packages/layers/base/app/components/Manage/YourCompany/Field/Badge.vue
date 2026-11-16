<script setup lang="ts">
const {
  actions = [],
  labelOverrides,
  modifiedByStaff = false
} = defineProps<{
  actions?: ActionType[]
  labelOverrides?: TableLabelOverrides
  modifiedByStaff?: boolean
}>()

// the staff badge (resumed draft, value set by a staff filing) leads the action badge, same as table rows
const badges = computed(() => getTableBadges(
  // @ts-expect-error - first arg is typed as a tanstack table row
  { original: { new: { actions: actions }, modifiedByStaff } },
  labelOverrides?.badges
))
</script>

<template>
  <div
    v-if="badges.length"
    class="flex flex-wrap gap-1"
  >
    <UBadge
      v-for="(badge, i) in badges"
      :key="i"
      v-bind="badge"
    />
  </div>
</template>
