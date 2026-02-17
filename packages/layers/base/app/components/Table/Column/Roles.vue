<script setup lang="ts">
const { roles, isRemoved } = defineProps<{ roles: PartyRoleSchema, isRemoved: boolean }>()
const roleOrder = [
  // NOTE: other roles have no ordering use case yet
  RoleTypeUi.CEO,
  RoleTypeUi.CFO,
  RoleTypeUi.PRESIDENT,
  RoleTypeUi.VICE_PRESIDENT,
  RoleTypeUi.CHAIR,
  RoleTypeUi.TREASURER,
  RoleTypeUi.SECRETARY,
  RoleTypeUi.ASSISTANT_SECRETARY,
  RoleTypeUi.OTHER
]

const orderedRoles = computed(() => {
  const roleOrderMap = new Map(roleOrder.map((role, index) => [role, index]))
  const activeRoles = roles.filter(r => !r.cessationDate)
  const displayRoles = isRemoved ? roles : activeRoles
  return [...displayRoles].sort((a, b) => {
    const indexA = roleOrderMap.get(a.roleType) ?? Infinity
    const indexB = roleOrderMap.get(b.roleType) ?? Infinity
    return indexA - indexB
  })
})
</script>

<template>
  <ul>
    <li v-for="role, i in orderedRoles" :key="`role-${role.roleType}-${i}`">
      {{ $t(`roleType.${role.roleType}`) }}
    </li>
  </ul>
</template>
