<script setup lang="ts">
definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Form Confirm Completing Party' }]
})

const editableName = ref(false)

const state = reactive<{ confirmCompletingParty: ConfirmCompletingPartySchema }>({
  confirmCompletingParty: {
    completingPartyName: '',
    confirmed: false
  }
})

const submittedData = ref<ConfirmCompletingPartySchema | undefined>(undefined)

function onSubmit() {
  submittedData.value = { ...state.confirmCompletingParty }
}
</script>

<template>
  <UContainer>
    <h1>Form - Confirm Completing Party</h1>
    <div class="p-4 bg-white my-4">
      <UCheckbox
        v-model="editableName"
        label="Editable name (staff)"
        data-testid="toggle-editable-name"
      />
    </div>
    <UForm
      :state="state"
      class="space-y-4"
      @submit="onSubmit"
    >
      <FormConfirmCompletingParty
        :key="String(editableName)"
        v-model="state.confirmCompletingParty"
        name="confirmCompletingParty"
        order="1"
        :editable-name="editableName"
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
