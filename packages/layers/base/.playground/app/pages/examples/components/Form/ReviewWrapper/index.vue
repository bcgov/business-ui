<script setup lang="ts">
definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Form Review Wrapper' }]
})

const viewOnly = ref(false)
</script>

<template>
  <div class="py-10 flex flex-col gap-10 items-center">
    <ConnectPageSection
      :heading="{ label: 'Form Review Wrapper' }"
      ui-body="p-10"
      class="w-full max-w-5xl"
    >
      <div class="mb-6 bg-shade p-4">
        <UCheckbox
          v-model="viewOnly"
          label="View-only mode"
        />
      </div>

      <FormReviewWrapper :view-only="viewOnly">
        <ConnectPageSection
          :heading="{ label: 'Review Content' }"
          ui-body="p-4"
        >
          <p>This content remains visible in both modes.</p>
        </ConnectPageSection>

        <template #submission-fields>
          <ConnectPageSection
            :heading="{ label: 'Submission Fields' }"
            ui-body="p-4"
          >
            <p>These fields are hidden in view-only mode.</p>
          </ConnectPageSection>
        </template>
      </FormReviewWrapper>
    </ConnectPageSection>
  </div>
</template>
