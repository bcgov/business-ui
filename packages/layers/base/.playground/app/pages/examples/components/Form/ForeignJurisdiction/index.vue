<script setup lang="ts">
definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Form Foreign Jurisdiction' }]
})

const state = reactive<{ foreignJurisdiction: ForeignJurisdictionSchema }>({
  foreignJurisdiction: {
    country: '',
    region: ''
  }
})

const submittedData = ref<ForeignJurisdictionSchema | undefined>(undefined)

function onSubmit() {
  submittedData.value = { ...state.foreignJurisdiction }
}
</script>

<template>
  <UContainer>
    <h1>Form - Foreign Jurisdiction</h1>
    <UForm
      :state="state"
      class="space-y-4"
      @submit="onSubmit"
    >
      <FormForeignJurisdiction
        v-model="state.foreignJurisdiction"
        name="foreignJurisdiction"
        order="1"
        description="Enter the jurisdiction you will be continuing out to."
      />
      <UButton type="submit" label="Submit" />
    </UForm>
    <ConnectPageSection
      v-if="submittedData"
      :heading="{ label: 'Submitted data' }"
      ui-body="p-10"
      class="mt-4"
    >
      <pre data-testid="submitted-data">{{ JSON.stringify(submittedData, null, 2) }}</pre>
    </ConnectPageSection>
  </UContainer>
</template>
