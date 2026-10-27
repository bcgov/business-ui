<script setup lang="ts">
definePageMeta({
  layout: 'connect-auth'
})

const defaultFolio = '777555222'
const state = reactive<{ folio: FolioSchema }>({
  folio: { folioNumber: defaultFolio }
})
</script>

<template>
  <div class="py-10 flex flex-col gap-10 items-center">
    <ConnectPageSection
      :heading="{ label: 'Folio Form (with default folio)' }"
      ui-body="p-10"
      class="max-w-3xl"
    >
      <UForm
        :state
        novalidate
        class="gap-6 flex flex-col"
      >
        <div class="p-10 bg-shade">
          <FormFolio
            v-model="state.folio"
            name="folio"
            :default-folio="defaultFolio"
          />
        </div>
        <p data-testid="filed-folio">
          Folio filed: {{ state.folio.folioNumber || '(none)' }}
        </p>
      </UForm>
    </ConnectPageSection>
  </div>
</template>
