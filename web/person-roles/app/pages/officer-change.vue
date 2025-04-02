<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'

const officerStore = useOfficerStore()

const addOfficer = ref<boolean>(false)

async function onFormSubmit(event: FormSubmitEvent<any>) {
  officerStore.addOfficer(event.data)
  // console.info(event.data)
}

onMounted(async () => {
  const { $legalApi } = useNuxtApp()

  // const res = await $legalApi('/businesses/BC0871274/filings').catch()
  const res = await $legalApi('/businesses/BC0871274/parties').catch()

  console.log(res)
})
</script>

<template>
  <div class="py-10 space-y-10">
    <h1>Officer Change</h1>

    <UButton
      label="Add Officer"
      class="px-5 py-3"
      color="primary"
      icon="i-mdi-account-plus"
      variant="outline"
      :disabled="addOfficer === true"
      @click="addOfficer = true"
    />

    <FormOfficerChange
      v-if="addOfficer"
      @submit="onFormSubmit"
      @cancel="addOfficer = false"
    />

    <TableOfficerChange />

    <pre>{{ officerStore.newOfficers }}</pre>
  </div>
</template>
