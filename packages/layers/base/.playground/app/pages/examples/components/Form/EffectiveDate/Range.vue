<script setup lang="ts">
definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Form Effective Date Range' }]
})

// several ranges on one page - each keeps its own order error, alert and focus target
const state = reactive({
  director: {
    start: { dateInput: '2026-07-15' },
    end: { dateInput: '2026-06-01' } // out of order on load
  },
  receiver: {
    start: { dateInput: '2026-09-10' },
    end: { dateInput: '2026-08-01' } // out of order on load
  }
})

const directorRangeRef = useTemplateRef<FormEffectiveDateRangeRef>('director-range-ref')
const receiverRangeRef = useTemplateRef<FormEffectiveDateRangeRef>('receiver-range-ref')

const lastResult = ref('')

async function onSubmit() {
  const results = await Promise.allSettled([
    directorRangeRef.value?.validate(),
    receiverRangeRef.value?.validate()
  ])

  const rejected = results.find(r => r.status === 'rejected')
  if (rejected) {
    // focuses the first invalid input across all ranges
    onFormSubmitError(rejected.reason)
    lastResult.value = `${results.filter(r => r.status === 'rejected').length} range(s) invalid`
    return
  }

  lastResult.value = 'All ranges valid'
  console.info('Form data: ', toRaw(state))
}
</script>

<template>
  <div class="py-10 flex flex-col gap-10 items-center">
    <ConnectPageSection
      :heading="{ label: 'Multiple Effective Date Ranges on one page' }"
      class="max-w-6xl w-full"
      ui-body="flex flex-col gap-6 py-4"
    >
      <FormEffectiveDateRange
        ref="director-range-ref"
        v-model:start="state.director.start"
        v-model:end="state.director.end"
        label="Director"
        description="Starts <strong>out of order</strong> - shows its own error."
      />

      <USeparator />

      <FormEffectiveDateRange
        ref="receiver-range-ref"
        v-model:start="state.receiver.start"
        v-model:end="state.receiver.end"
        label="Receiver"
        description="Starts <strong>out of order</strong>, with bounds: start ≥ 2026-01-01, end ≤ 2026-12-31."
        :start-bounds="{ min: { date: '2026-01-01' } }"
        :end-bounds="{ max: { date: '2026-12-31' } }"
        :end-required="true"
      />

      <div class="flex gap-6 justify-end items-center padding-x-default">
        <span v-if="lastResult" class="text-sm text-neutral">{{ lastResult }}</span>
        <UButton :label="$t('label.done')" @click="onSubmit" />
      </div>
    </ConnectPageSection>

    <ConnectPageSection
      :heading="{ label: 'State' }"
      class="max-w-6xl w-full"
      ui-body="p-4"
    >
      <pre class="text-xs">{{ state }}</pre>
    </ConnectPageSection>
  </div>
</template>
