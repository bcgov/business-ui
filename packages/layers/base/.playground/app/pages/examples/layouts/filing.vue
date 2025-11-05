<script setup lang="ts">
definePageMeta({
  layout: 'connect-pay-tombstone-buttons',
  breadcrumbs: [
    { to: '/', label: 'Examples' },
    { label: 'Filing Layout' }
  ]
})

useHead({
  title: 'Filing Layout Example'
})

const { businessTombstone, setFilingDefault, setPublicDefault } = useBusinessTombstone()
businessTombstone.value.title = { text: 'Business Filing Layout', as: 'h1' }

const { setButtonControl } = useConnectButtonControl()

setButtonControl({
  leftGroup: { buttons: [{ label: 'Left Button', onClick: () => window.alert('Left Button!') }] },
  rightGroup: { buttons: [{ label: 'Right Button', onClick: () => window.alert('Right Button!') }] }
})

const publicView = ref(false)
const identifier = ref('')
const loading = ref(false)

const loadTombstone = async () => {
  loading.value = true
  if (publicView.value) {
    await setPublicDefault(identifier.value)
  } else {
    await setFilingDefault(identifier.value)
  }
  loading.value = false
}
</script>

<template>
  <div class="my-10 space-y-5 border border-black">
    <div class="p-10 space-y-5">
      <h2>Slot Content</h2>
      <div class="bg-shade-inverted p-10 rounded space-y-3">
        <USwitch
          v-model="publicView"
          label="Public business tombstone"
        />
        <ConnectInput
          id="identifier-input"
          v-model="identifier"
          label="Business Identifier"
        />
        <UButton
          :disabled="!identifier"
          label="Load Tombstone Data"
          :loading
          @click.stop="loadTombstone()"
        />
      </div>
    </div>
  </div>
</template>
