<script setup lang="ts">
import type { BadgeProps } from '@nuxt/ui'

const props = defineProps<{
  party: PartyNameSchema
  badges: BadgeProps[]
  isRemoved: boolean
}>()

const name = computed<string>(() => {
  return props.party.partyType === PartyType.PERSON
    ? `${props.party.firstName} ${props.party.middleName} ${props.party.lastName}`.toUpperCase()
    : props.party.businessName?.toUpperCase() || ''
})

// FUTURE: add preferred name
// const preferredName = computed(() => {
//   return // preferred name logic
// })
// preferredName
// ? h('div', { class: 'flex flex-col' }, [
//   h('i', { class: 'text-sm italic font-normal' }, t('label.preferredName') + ':'),
//   h('span', { class: 'text-sm' }, preferredName.toUpperCase())
// ])
// : null
</script>

<template>
  <div
    :class="[
      { 'opacity-50': isRemoved },
      'pl-6 pr-2 py-4 font-bold min-w-48 max-w-48 whitespace-normal flex flex-col gap-2 text-neutral-highlighted',
      'text-sm'
    ]"
  >
    <span>{{ name }}</span>
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
