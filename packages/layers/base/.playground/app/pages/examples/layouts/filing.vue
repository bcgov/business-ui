<script setup lang="ts">
definePageMeta({
  layout: 'filing',
  breadcrumbs: [
    { to: '/', label: 'Examples' },
    { label: 'Filing Layout' }
  ]
})

useHead({
  title: 'Filing Layout Example'
})

const { filingTombstone } = useFilingTombstone()
filingTombstone.value.title = { text: 'Business Filing Layout', as: 'h1' }

const { setButtonControl } = useConnectButtonControl()

setButtonControl({
  leftGroup: { buttons: [{ label: 'Left Button', onClick: () => window.alert('Left Button!') }] },
  rightGroup: { buttons: [{ label: 'Right Button', onClick: () => window.alert('Right Button!') }] }
})
</script>

<template>
  <div class="my-10 space-y-5 border border-black">
    <div class="p-10">
      Slot Content
    </div>
  </div>
</template>
