<script setup lang="ts">
definePageMeta({
  layout: 'filing',
  buttonControl: {
    leftGroup: { buttons: [{ label: 'Left Button', onClick: () => window.alert('Left Button!') }] },
    rightGroup: { buttons: [{ label: 'Right Button', onClick: () => window.alert('Right Button!') }] }
  }
})

useHead({
  title: 'Filing Layout Example'
})

const localePath = useLocalePath()

const { filingTombstone } = useFilingTombstone()
filingTombstone.value.title = { text: 'Business Filing Layout', as: 'h1' }

setBreadcrumbs([
  {
    to: localePath('/'),
    label: 'Examples'
  },
  {
    label: 'Filing Layout'
  }
])
</script>

<template>
  <div class="my-10 space-y-5 border border-black">
    <div class="p-10">
      Slot Content
    </div>
  </div>
</template>
