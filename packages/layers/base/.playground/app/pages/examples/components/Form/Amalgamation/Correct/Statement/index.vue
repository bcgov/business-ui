<script setup lang="ts">
import type { Form } from '@nuxt/ui'

definePageMeta({
  layout: 'connect-auth'
})
type FullSchema = { courtApproval: boolean }

const state = ref<FullSchema>({
  courtApproval: false
})

const formRef = useTemplateRef<Form<FullSchema>>('form-ref')

const hasErrors = computed<boolean | undefined>(() => {
  const errors = formRef.value?.getErrors()
  return (errors && errors.length > 0)
})

async function onSubmit() {
  console.info('Form data: ', state.value)
}
</script>

<template>
  <div class="py-10 flex flex-col gap-10 items-center">
    <ConnectPageSection
      :heading="{ label: 'Amalgamation Correct Statement Form (default/nested)' }"
      :ui-body="hasErrors ? 'p-10 border-l-2 border-error' : 'p-10'"
      class="max-w-4xl"
    >
      <FormAmalgamationCorrectStatement
        v-model="state"
        variant="correct"
        state-key="manage-amalgamation"
        @done="onSubmit"
      />
    </ConnectPageSection>
  </div>
</template>
