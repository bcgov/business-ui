<script setup lang="ts">
definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ to: '/', label: 'Examples' }, { label: 'Pre-Existing Company Provisions' }]
})
</script>

<template>
  <div class="py-10 flex flex-col gap-10 items-center">
    <ConnectPageSection
      :heading="{ label: 'PreExistingCompanyProvisions' }"
      class="max-w-3xl"
      ui-body="p-10 bg-shade"
    >
      <FormPreExistingCompanyProvisions order="X" />
    </ConnectPageSection>
  </div>
</template>
