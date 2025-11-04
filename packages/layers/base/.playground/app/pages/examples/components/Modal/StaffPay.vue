<script setup lang="ts">
definePageMeta({
  layout: 'connect-pay'
})

useHead({
  title: 'ModalStaffPay Example'
})

const localePath = useLocalePath()

setBreadcrumbs([
  {
    to: localePath('/'),
    label: 'Examples'
  },
  {
    label: 'ModalStaffPay'
  }
])

const feeStore = useConnectFeeStore()

const exampleFeeCode = 'BSRCH'

await feeStore.initFees(
  [{ code: exampleFeeCode, entityType: 'BUS', label: 'Example fee' }],
  { label: 'Example placeholder text', matchServiceFeeToCode: exampleFeeCode }
)
feeStore.addReplaceFee(exampleFeeCode)

const { staffPaymentModal } = useModal()

const onSubmit = () => {
  alert('submitted')
}

const priority = ref(false)

function openExample() {
  staffPaymentModal.open({
    showPriority: priority.value,
    onSubmit
  })
}
</script>

<template>
  <div class="py-8 space-y-6">
    <h1>
      Modal Staff Payment
    </h1>

    <ConnectPageSection :heading="{ label: 'Example' }" ui-body="p-4 space-y-4">
      <USwitch v-model="priority" label="Show priority" />
      <UButton label="Open" @click="openExample()" />
    </ConnectPageSection>
  </div>
</template>
