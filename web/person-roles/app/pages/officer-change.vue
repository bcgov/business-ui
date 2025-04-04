<script setup lang="ts">
const { t } = useI18n()
const officerStore = useOfficerStore()

useHead({
  title: t('page.officerChange.title')
})

async function onFormSubmit(data: Partial<Officer>) {
  officerStore.addNewOfficer(data as Officer)
  officerStore.addingOfficer = false
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
  <div class="py-10 space-y-10 max-w-[945px] mx-auto">
    <h1>{{ $t('page.officerChange.h1') }}</h1>

    <UButton
      :label="$t('label.addOfficer')"
      class="px-5 py-3"
      color="primary"
      icon="i-mdi-account-plus"
      variant="outline"
      :disabled="officerStore.addingOfficer === true"
      @click="officerStore.addingOfficer = true"
    />

    <FormOfficerChange
      v-if="officerStore.addingOfficer"
      :title="$t('label.addOfficer')"
      @officer-change="onFormSubmit"
      @cancel="officerStore.addingOfficer = false"
    />

    <TableOfficerChange />
  </div>
</template>
