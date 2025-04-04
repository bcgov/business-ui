<script setup lang="ts">
const officerStore = useOfficerStore()

const addOfficer = ref<boolean>(false)

async function onFormSubmit(data: Partial<Officer>) {
  officerStore.addNewOfficer(data as Officer)
  // console.info(event.data)
}

// TODO: load from legal api
// onMounted(async () => {
//   const { $legalApi } = useNuxtApp()

//   // const res = await $legalApi('/businesses/BC0871274/filings').catch()
//   const res = await $legalApi('/businesses/BC0871274/parties').catch()

//   console.log(res)
// })
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
      @officer-change="onFormSubmit"
      @cancel="addOfficer = false"
    />

    <TableOfficerChange />
  </div>
</template>
