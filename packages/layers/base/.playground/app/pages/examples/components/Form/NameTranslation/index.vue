<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Form Name Translation' }]
})

const schema = getActiveNameTranslationSchema()
const state = ref<ActiveNameTranslationSchema | undefined>(schema.parse({}))

function resetForm() {
  state.value = schema.parse({})
}

function onDone() {
  console.info('Name translation form data:', state.value)
}
</script>

<template>
  <UContainer>
    <ConnectPageSection
      :heading="{ label: 'Form Name Translation - Add Variant' }"
      ui-body="p-10"
      class="my-10"
    >
      <div class="space-y-6">
        <FormNameTranslations
          v-if="state"
          v-model="state"
          variant="add"
          :title="t('label.addNameTranslation')"
          name="activeNameTranslation"
          state-key="playground-form-name-translation"
          @done="onDone"
          @cancel="resetForm"
        />

        <div class="space-y-2">
          <h3 class="font-semibold">
            Current model
          </h3>
          <pre class="p-4 bg-gray-50 rounded border border-gray-200 text-sm">{{ state }}</pre>
        </div>
      </div>
    </ConnectPageSection>
  </UContainer>
</template>
